export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('load.messages', async (data, send, next) => {
    const messages = await db.findMany('Message', {
      where: {},
      orderBy: {
        timestamp: 'desc'
      }
    })
    send(messages)
  })
}
