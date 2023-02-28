import fs from 'fs/promises'
import url from 'url'
import path from 'path'
import { IncrementalMerkleTree } from '@unirep/utils'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const _internalLeaves = await fs.readFile(
  path.join(__dirname, '../data/unirep_owners.json')
)
const internalLeaves = JSON.parse(_internalLeaves.toString())
const internalTree = new IncrementalMerkleTree(17)
for (const leaf of internalLeaves) {
  internalTree.insert(BigInt(leaf))
}

export default {
  ens: '0x119980738cf0bc5db93b09e3846604577c635422cbec6ae6ce691b8afebc8d06',
  internal: internalTree.root,
}
