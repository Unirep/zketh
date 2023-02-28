import { ethers } from 'ethers'
import prover from '../singletons/prover.mjs'
import { APP_ADDRESS } from '../config.mjs'
import channels from '../channels.mjs'

export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('create.message', async (data, send, next) => {
    const { text, publicSignals, proof, channelName } = data
    if (!text.trim()) return send(0)
    const verifyPromise = prover.verifyProof(
      'proveAddress',
      publicSignals,
      proof
    )
    const timestampSpread = 250
    let timestamp = +new Date()
    let existing
    do {
      timestamp +=
        Math.floor(Math.random() * timestampSpread) - timestampSpread / 2
      existing = await db.count('Message', { timestamp })
    } while (existing > 0)
    const valid = await verifyPromise
    if (!valid) {
      send('Invalid proof', 1)
      return
    }
    // check that the epoch matches
    // it will always be epoch 0
    if (BigInt(0) !== BigInt(publicSignals[3])) {
      send('Wrong epoch', 1)
      return
    }
    // check that the attester id matches
    if (BigInt(APP_ADDRESS) !== BigInt(publicSignals[2])) {
      send('Wrong attester', 1)
      return
    }
    // check that the signature matches the text content
    const hash = ethers.utils.keccak256(
      '0x' + Buffer.from(text, 'utf8').toString('hex')
    )
    const sig_data = BigInt(hash) >> BigInt(6)
    if (sig_data !== BigInt(publicSignals[4])) {
      send('Signature mismatch', 1)
      return
    }
    // check the state tree root
    const stateRoot = await db.findOne('StateTreeRoot', {
      where: {
        hash: BigInt(publicSignals[0]).toString(),
      },
    })
    if (!stateRoot) {
      send('Invalid state tree root', 1)
      return
    }
    // check the address tree root
    if (!channels[channelName]) {
      send(`Invalid channel "${channelName}"`, 1)
      return
    }
    if (BigInt(publicSignals[1]) !== BigInt(channels[channelName])) {
      send(`Invalid address tree root`, 1)
      return
    }
    // if everything matches add a message record and
    // broadcast to all participants
    const msg = await db.create('Message', {
      text,
      timestamp,
      proof: JSON.stringify(proof),
      publicSignals: JSON.stringify(publicSignals),
      channelName,
    })
    // send this message to all connected clients
    wsApp.broadcast('msg', msg)
    // 0 status code is success
    send(0)
  })
}
