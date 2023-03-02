import { channelNameRegex } from '../channels.mjs'

export default ({ wsApp, db, sychronizer }) => {
  wsApp.handle('check.channel.name', async (data, send) => {
    const { name } = data
    if (!channelNameRegex.test(name)) {
      return send({ valid: false })
    }
    const existing = await db.findOne('Channel', {
      where: {
        name,
      },
    })
    send({ valid: !existing })
  })
}
