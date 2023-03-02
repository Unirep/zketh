import { channelpath } from '../config.mjs'
import { channelNameRegex } from '../channels.mjs'
import { IncrementalMerkleTree } from '@unirep/utils'
import fs from 'fs/promises'

const stringify = (v) =>
  JSON.stringify(v, (_, _v) => {
    if (typeof _v === 'bigint') return `0x${_v.toString(16)}`
    return _v
  })

export default ({ wsApp, db, sychronizer }) => {
  wsApp.handle('create.channel', async (data, send) => {
    const { name, addresses } = data
    if (!Array.isArray(addresses)) {
      return send('Invalid addresses', 1)
    }
    if (addresses.length > 50) {
      return send('Too many addresses', 1)
    }
    const addressList = []
    for (const addr of addresses) {
      const v = BigInt(addr)
      if (v < 0 || v > BigInt(2) ** BigInt(160)) {
        send('Invalid address', 1)
        return
      }
      addressList.push('0x' + v.toString(16))
    }
    if (!channelNameRegex.test(name)) {
      return send('Invalid name', 1)
    }
    await db.transaction(async (_db) => {
      const existing = await db.findOne('Channel', {
        where: {
          name,
        },
      })
      if (existing) {
        return send('Name is taken', 1)
      }
      // do the fs operations in the tx
      const owners = addressList.map((v) => `0x${v.toString(16)}`).join('\n')
      const csvPromise = fs.writeFile(channelpath(`${name}.csv`), owners)
      const tree = new IncrementalMerkleTree(20)
      for (const addr of addressList) {
        tree.insert(addr)
      }
      const treeData = stringify({
        nodes: tree._nodes,
        root: tree._root,
      })
      await fs.writeFile(channelpath(`${name}.json`), treeData)
      await csvPromise
      _db.create('Channel', {
        name,
        dataPath: `channels/${name}.json`,
        memberCount: addressList.length,
        root: tree._root.toString(),
      })
    })
    send(0)
  })
}
