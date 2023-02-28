export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('load.messages', async (data, send, next) => {
    const { channelName } = data
    const messages = await db.findMany('Message', {
      where: {
        channelName,
      },
      orderBy: {
        timestamp: 'desc',
      },
    })
    send(messages)
  })
}
