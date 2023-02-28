import prover from '../singletons/prover.mjs'

export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('create.message', async (data, send, next) => {
    const { text, publicSignals, proof } = data
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
      send(1, 'Invalid proof')
      return
    }
    // TODO: if valid check the address tree root and state tree root
    const msg = await db.create('Message', {
      text,
      timestamp,
    })
    // send this message to all connected clients
    wsApp.broadcast('msg', msg)
    // 0 status code is success
    send(0)
  })
}
