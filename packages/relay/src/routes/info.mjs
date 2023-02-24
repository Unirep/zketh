export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('info', async (data, send, next) => {
    send({
      version: '0',
    })
  })
}
