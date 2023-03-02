import channels from '../channels.mjs'

export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('load.channels', async (data, send, next) => {
    const channels = await db.findMany('Channel', { where: {} })
    send(channels)
  })
}
