export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('create.message', async (data, send, next) => {
    // TODO: verify zk proof to send message
    const { text } = data
    const timestampSpread = 250
    let timestamp = +new Date()
    let existing
    do {
      timestamp +=
        Math.floor(Math.random() * timestampSpread) - timestampSpread / 2
      existing = await db.count('Message', { timestamp })
    } while (existing > 0)
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
