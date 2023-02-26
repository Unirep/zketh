import { makeAutoObservable } from 'mobx'
import { ZkIdentity, Strategy, F } from '@unirep/utils'
import { SECP256K1_N, getPointPreComputes, splitToRegisters } from '../utils/ec'
import { APP_ADDRESS } from '../config'
import prover from './prover'
import { fromRpcSig, hashPersonalMessage } from '@ethereumjs/util'
import elliptic from 'elliptic'
import BN from 'bn.js'
import poseidon from 'poseidon-lite'

const ec = new elliptic.ec('secp256k1')

export default class Auth {
  addresses = []
  id = null
  sig = null
  hash = null
  address = null
  publicSignals = null
  proof = null

  messages = []

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {}

  async getAddresses() {
    this.addresses = await ethereum.request({ method: 'eth_requestAccounts' })
  }

  async reloadAddresses() {
    this.addresses = await ethereum.request({ method: 'eth_accounts' })
  }

  async getProofSignature(address) {
    if (!window.ethereum) throw new Error('No injected window.ethereum')

    const CHAIN_ID = 421613

    const message = JSON.stringify({
      domain: {
        chainId: CHAIN_ID, // arb goerli
        name: 'zketh',
        verifyingContract: APP_ADDRESS,
        version: '0',
      },
      message: {
        whatami: '>zketh unirep identity<',
        warning: 'do not sign outside of zketh.io',
      },
      primaryType: 'SemaphoreKey',
      types: {
        SemaphoreKey: [
          {
            name: 'whatami',
            type: 'string',
          },
          {
            name: 'warning',
            type: 'string',
          },
        ],
      },
    })
    this.hash = hashPersonalMessage(
      Buffer.from(`${message.length}${message}`, 'utf8')
    )

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x' + BigInt(CHAIN_ID).toString(16) }],
      })
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x' + BigInt(CHAIN_ID).toString(16),
              chainName: 'Arbitrum Goerli',
              nativeCurrency: {
                name: 'arbitrum eth',
                symbol: 'AGOR',
                decimals: 18,
              },
              rpcUrls: ['https://arbitrum.goerli.unirep.io'],
            },
          ],
        })
      } else {
        throw err
      }
    }

    const sig = await window.ethereum.request({
      method: 'eth_signTypedData_v4',
      params: [address, message],
    })
    this.address = address
    this.sig = sig
    // TODO: this is unsafe, need to use keccak or sha512
    const sighash = BigInt(sig) % F
    const nullifier = poseidon([sighash, 0])
    const trapdoor = poseidon([sighash, 1])
    this.id = new ZkIdentity(0)
    this.id._identityTrapdoor = trapdoor
    this.id._identityNullifier = nullifier
    this.id._secret = [nullifier, trapdoor]
  }

  async proveAddress(onUpdate) {
    // generate t precomputes as download happens
    onUpdate({ state: 0, text: 'building witness' })

    onUpdate({ state: 0, progress: '0' })
    const inputs = new Promise(async (rs, rj) => {
      await new Promise((r) => setTimeout(r, 1000))
      const d = fromRpcSig(this.sig)
      const hash = BigInt('0x' + Buffer.from(this.hash).toString('hex'))
      const r = BigInt('0x' + Buffer.from(d.r).toString('hex'))
      const s = BigInt('0x' + Buffer.from(d.s).toString('hex'))
      const v = BigInt(d.v)

      const isYOdd = (v - 27n) % 2n
      const rPoint = ec.keyFromPublic(ec.curve.pointFromX(new BN(r), isYOdd))
      const rInv = new BN(r).invm(SECP256K1_N)

      // w = -(r^-1 * msg)
      const _r = rInv.neg().umod(SECP256K1_N)
      // compute w and U in circuit
      // const w = rInv.mul(new BN(msgHash)).neg().umod(SECP256K1_N);
      // U = -(w * G) = -(r^-1 * msg * G)
      // const U = ec.curve.g.mul(w);

      // T = r^-1 * R
      const T = rPoint.getPublic().mul(rInv)

      console.log('Calculating point cache...')
      console.time('Point cache calculation')
      const TPreComputes = await getPointPreComputes(T, (progress) =>
        onUpdate({ state: 0, progress })
      )
      console.timeEnd('Point cache calculation')

      const input = {
        TPreComputes,
        _r: [splitToRegisters(_r)],
        m: [splitToRegisters(hash)],
        // U: [splitToRegisters(U.x), splitToRegisters(U.y)],
        s: [splitToRegisters(s)],
        identity_nullifier: this.id.identityNullifier.toString(),
        identity_trapdoor: this.id.trapdoor.toString(),
        // TODO
        attester_id: 1221121,
        epoch: 1,
      }
      rs(input)
    })
    inputs.then(() => onUpdate({ state: 0, done: true }))
    const proofPromise = prover.genProofAndPublicSignals(
      'signupWithAddress',
      inputs,
      onUpdate
    )
    await inputs
    const { publicSignals, proof } = await proofPromise
    onUpdate({ state: 30, text: 'building proof', progress: 'done' })
    return { publicSignals, proof }
  }
}
