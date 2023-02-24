import url from 'url'
import path from 'path'
import fs from 'fs'
import express from 'express'
import especial from 'especial'
import { provider, PRIVATE_KEY } from './config.mjs'
import TransactionManager from './singletons/TransactionManager.mjs'
import synchronizer from './singletons/AppSynchronizer.mjs'
import HashchainManager from './singletons/HashchainManager.mjs'
import schema from './schema.mjs'
import { SQLiteConnector } from 'anondb/node.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

await synchronizer.start()

TransactionManager.configure(PRIVATE_KEY, provider, synchronizer._db)
await TransactionManager.start()

HashchainManager.startDaemon()

// initialize websocket server
let wsApp, httpApp
{
  const app = especial()
  const port = process.env.WS_PORT ?? 8001
  app.listen(port, () => console.log(`Websocket on port ${port}`))
  app.handle('ping', (_, send) => send('pong'))
  wsApp = app
}

// initialize http server
{
  const app = express()
  const port = process.env.WS_PORT ?? 8000
  app.listen(port, () => console.log(`HTTP on port ${port}`))
  app.use('*', (req, res, next) => {
    res.set('access-control-allow-origin', '*')
    res.set('access-control-allow-headers', '*')
    next()
  })
  app.use(express.json())
  app.use('/build', express.static(path.join(__dirname, '../keys')))
  httpApp = app
}

const db = await SQLiteConnector.create(schema, ':memory:')

const state = { app: httpApp, wsApp, db, synchronizer }
await importFunctionDirectory('ws', state)
await importFunctionDirectory('http', state)

// name relative to file location
async function importFunctionDirectory(dirname, state) {
  // import all non-index files from __dirname/name this folder
  const routeDir = path.join(__dirname, dirname)
  const routes = await fs.promises.readdir(routeDir)
  for (const routeFile of routes) {
    const { default: route } = await import(path.join(routeDir, routeFile))
    route(state)
  }
}
