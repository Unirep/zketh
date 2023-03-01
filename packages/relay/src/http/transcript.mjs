export default ({ app, db, synchronizer }) => {
  app.get('/transcript/:channelName', async (req, res) => {
    try {
      const { channelName } = req.params
      const data = await db.findMany('Message', {
        where: {
          channelName,
        },
        orderBy: {
          timestamp: 'desc',
        },
      })
      res.json(data)
    } catch (err) {
      console.log(err)
      res.status(500).end(err)
    }
  })
}
