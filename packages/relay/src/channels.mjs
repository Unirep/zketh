import fs from 'fs/promises'
import url from 'url'
import path from 'path'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const _channels = [
  {
    name: 'ens',
    dataPath: `data/ens_tree.json`,
  },
  {
    name: 'internal',
    dataPath: `data/internal_tree.json`,
  },
]

console.time('Building trees')
const channels = await Promise.all(
  _channels.map(async (channel) => {
    const data = await fs.readFile(path.join(__dirname, '..', channel.dataPath))
    const treeData = JSON.parse(data, (key, v) => {
      if (typeof v === 'string' && v.startsWith('0x')) {
        return BigInt(v)
      }
      return v
    })
    return {
      ...channel,
      root: treeData.root.toString(),
      elements: treeData.nodes[0],
      memberCount: treeData.nodes[0].length,
    }
  })
)
console.timeEnd('Building trees')

export default channels
