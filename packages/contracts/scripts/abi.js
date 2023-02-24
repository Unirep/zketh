const fs = require('fs')
const path = require('path')

const { abi } = require('../artifacts/contracts/ZKEth.sol/ZKEth.json')

fs.writeFileSync(path.join(__dirname, '../abi/ZKEth.json'), JSON.stringify(abi))
