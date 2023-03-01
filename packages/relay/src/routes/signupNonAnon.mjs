import { BaseProof } from '@unirep/circuits'
import prover from '../singletons/prover.mjs'
import { ethers } from 'ethers'
import TransactionManager from '../singletons/TransactionManager.mjs'
import { APP_ADDRESS } from '../config.mjs'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const UnirepAppABI = require('@zketh/contracts/abi/ZKEth.json')

export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('user.register.nonanon', async (data, send) => {
    const valid = await prover.verifyProof(
      'signupNonAnon',
      data.publicSignals,
      data.proof
    )
    if (!valid) {
      send('Invalid proof', 1)
      return
    }

    const { publicSignals, proof } = new BaseProof(
      data.publicSignals,
      data.proof
    )
    // otherwise we build a transaction and send it
    const appContract = new ethers.Contract(APP_ADDRESS, UnirepAppABI)
    const calldata = appContract.interface.encodeFunctionData('signupNonAnon', [
      data.signature,
      publicSignals,
      proof,
    ])
    try {
      const hash = await TransactionManager.queueTransaction(
        APP_ADDRESS,
        calldata
      )
      send({ hash })
    } catch (err) {
      console.log(err)
      send(1, `tx error: ${err}`)
    }
  })
}
