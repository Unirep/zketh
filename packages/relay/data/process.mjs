import fs from 'fs/promises'
import { IncrementalMerkleTree } from '@unirep/utils'

const _data = await fs.readFile('./ens_owners.json')
const addresses = JSON.parse(_data.toString())

const tree = new IncrementalMerkleTree(17)

let x = 0
for (const address of addresses) {
  if (++x % 1000 === 0) console.log(x)
  tree.insert(BigInt(address))
}

const out = {
  nodes: tree._nodes,
  root: tree._root,
}

const s = JSON.stringify(out, (_, v) =>
  typeof v === 'bigint' ? `0x${v.toString(16)}` : v
)

await fs.writeFile('./ens_tree.json', s)
