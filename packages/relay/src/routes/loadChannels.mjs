import channels from '../channels.mjs'

export default ({ wsApp, db, synchronizer }) => {
  wsApp.handle('load.channels', async (data, send, next) => {
    send(
      channels.map((c) => {
        return {
          ...c,
          elements: null,
        }
      })
    )
  })
}
