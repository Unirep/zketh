import { makeAutoObservable } from 'mobx'
import { ethers } from 'ethers'
import { ZkIdentity, Strategy, F, IncrementalMerkleTree } from '@unirep/utils'
import { UserState } from '@unirep/core'
import { SECP256K1_N, getPointPreComputes, splitToRegisters } from '../utils/ec'
import { provider, UNIREP_ADDRESS, APP_ADDRESS, SERVER } from '../config'
import prover from './prover'
import { fromRpcSig, hashPersonalMessage } from '@ethereumjs/util'
import elliptic from 'elliptic'
import BN from 'bn.js'
import poseidon from 'poseidon-lite'
import { TypedDataUtils } from '@metamask/eth-sig-util'

const ec = new elliptic.ec('secp256k1')

export default class Auth {
  addresses = []
  id = null
  sig = null
  hash = null
  address = null
  publicSignals = null
  proof = null

  userState = null
  addressTree = null

  messages = []

  treeCache = {}

  constructor(state) {
    makeAutoObservable(this)
    this.state = state
    this.load()
  }

  async load() {}

  addressIndex(addr) {
    if (!this.addressTree) return -1
    return this.addressTree._nodes[0].indexOf(BigInt(addr))
  }

  async buildAddressTree() {
    this.addressTree = null
    const channel = this.state.msg.channels.find(
      ({ name }) => name === this.state.msg.activeChannel
    )
    if (!channel) throw new Error('Unknown channel')
    if (this.treeCache[this.state.msg.activeChannel]) {
      this.addressTree = this.treeCache[this.state.msg.activeChannel]
      return
    }
    const url = new URL(channel.dataPath, SERVER)
    const data = await fetch(url.toString()).then((r) => r.text())
    const treeData = await JSON.parse(data, (key, v) => {
      if (typeof v === 'string' && v.startsWith('0x')) {
        return BigInt(v)
      }
      return v
    })
    const tree = new IncrementalMerkleTree(20)
    console.log(treeData)
    tree._nodes = treeData.nodes
    tree._root = treeData.root
    this.addressTree = tree
    this.treeCache[this.state.msg.activeChannel] = tree
  }

  async startUserState() {
    if (!this.id) throw new Error('No ZK identity')

    this.userState = new UserState({
      provider,
      prover,
      unirepAddress: UNIREP_ADDRESS,
      attesterId: APP_ADDRESS,
      _id: this.id,
    })
    await this.userState.sync.start()
    await this.buildAddressTree()
  }

  // prove control of an address and sign some text
  async proveAddressData(text) {
    const addrIndex = this.addressIndex(BigInt(this.address))
    if (addrIndex === -1) {
      throw new Error('You are not authorized to chat here')
    }
    const addressTreeProof = this.addressTree.createProof(addrIndex)
    // take the upper 250 bits to fit into a bn128 field element
    const hash = ethers.utils.keccak256(
      '0x' + Buffer.from(text, 'utf8').toString('hex')
    )
    const sig_data = BigInt(hash) >> BigInt(6)
    const data = await this.userState.getData()
    const stateTree = await this.userState.sync.genStateTree(0)
    const index = await this.userState.latestStateTreeLeafIndex()
    const stateTreeProof = stateTree.createProof(index)
    const inputs = {
      sig_data,
      attester_id: APP_ADDRESS,
      identity_secret: this.id.secretHash,
      data,
      epoch: 0,
      address: this.address,
      state_tree_elements: stateTreeProof.siblings,
      state_tree_indices: stateTreeProof.pathIndices,
      address_tree_elements: addressTreeProof.siblings,
      address_tree_indices: addressTreeProof.pathIndices,
    }
    console.time('Message proof time')
    const { proof, publicSignals } = await prover.genProofWithCache(
      'proveAddress',
      inputs
    )
    console.timeEnd('Message proof time')
    return { publicSignals, proof }
  }

  async getAddresses() {
    this.addresses = await ethereum.request({ method: 'eth_requestAccounts' })
  }

  async reloadAddresses() {
    this.addresses = await ethereum.request({ method: 'eth_accounts' })
  }

  async getProofSignature(address) {
    if (!window.ethereum) throw new Error('No injected window.ethereum')

    const CHAIN_ID = 421613

    const message = {
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
    }

    this.hash = TypedDataUtils.eip712Hash(message, 'V4')

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
      params: [address, JSON.stringify(message)],
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
        attester_id: APP_ADDRESS,
        epoch: 0,
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
    this.proof = proof
    this.publicSignals = publicSignals
  }
}
