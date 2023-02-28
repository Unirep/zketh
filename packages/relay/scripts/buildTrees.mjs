import fs from 'fs/promises'
import url from 'url'
import path from 'path'
import { IncrementalMerkleTree } from '@unirep/utils'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const files = await fs.readdir(path.join(__dirname, '../data'))

const stringify = (v) =>
  JSON.stringify(v, (_, _v) => {
    if (typeof _v === 'bigint') return `0x${_v.toString(16)}`
    return _v
  })

for (const file of files) {
  if (!/_owners.csv/.test(file)) continue
  const targetFile = file.replace('_owners.csv', '_tree.json')
  try {
    await fs.stat(path.join(__dirname, '../data', targetFile))
    continue
  } catch (err) {
    // file doesn't exist so build it
  }
  let x = 0
  const addresses = (await fs.readFile(path.join(__dirname, '../data', file)))
    .toString()
    .split('\n')
  console.log(`Building tree for: ${file}`)
  const tree = new IncrementalMerkleTree(20)
  for (const address of addresses) {
    if (!address || !address.startsWith('0x')) continue
    if (++x % 1000 === 0) console.log(`${x} entries processed`)
    tree.insert(BigInt(address))
  }
  await fs.writeFile(
    path.join(__dirname, '../data', targetFile),
    stringify({
      nodes: tree._nodes,
      root: tree._root,
    })
  )
}
