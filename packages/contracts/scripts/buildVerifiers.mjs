import fs from 'fs/promises'
import path from 'path'
import url from 'url'
import hardhat from 'hardhat'
import hardhatConfig from '../hardhat.config.js'
import { createRequire } from 'module'
const { config } = hardhat

const require = createRequire(import.meta.url)
const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const verifiersPath = hardhatConfig?.paths?.sources
  ? path.join(hardhatConfig.paths.sources, 'verifiers')
  : path.join(config.paths.sources, 'verifiers')

const zkFilesPath = path.join('../../circuits/zksnarkBuild')

// create verifier folder
try {
  await fs.mkdir(verifiersPath, { recursive: true })
} catch (e) {
  console.log('Cannot create folder ', e)
}

const circuits = {
  signupWithAddress: 0,
  signupNonAnon: 1,
}

for (const circuit of Object.keys(circuits)) {
  const verifierName = createVerifierName(circuit)
  const solOut = path.join(verifiersPath, `${verifierName}.sol`)
  const vKey = require(path.join(zkFilesPath, `${circuit}.vkey.json`))

  console.log(`Exporting ${circuit} verification contract...`)
  const verifier = await genVerifier(verifierName, vKey)

  await fs.writeFile(solOut, verifier)
  await fs.copyFile(solOut, path.join(verifiersPath, `${verifierName}.sol`))
}

// helper functions

function createVerifierName(circuit) {
  return `${circuit.charAt(0).toUpperCase() + circuit.slice(1)}Verifier`
}

async function genVerifier(contractName, vk) {
  const templatePath = path.resolve(__dirname, './groth16Verifier.txt')

  let template = await fs.readFile(templatePath, 'utf8')

  template = template.replace('<%contract_name%>', contractName)

  const vkalpha1 =
    `uint256(${vk.vk_alpha_1[0].toString()}),` +
    `uint256(${vk.vk_alpha_1[1].toString()})`
  template = template.replace('<%vk_alpha1%>', vkalpha1)

  const vkbeta2 =
    `[uint256(${vk.vk_beta_2[0][1].toString()}),` +
    `uint256(${vk.vk_beta_2[0][0].toString()})], ` +
    `[uint256(${vk.vk_beta_2[1][1].toString()}),` +
    `uint256(${vk.vk_beta_2[1][0].toString()})]`
  template = template.replace('<%vk_beta2%>', vkbeta2)

  const vkgamma2 =
    `[uint256(${vk.vk_gamma_2[0][1].toString()}),` +
    `uint256(${vk.vk_gamma_2[0][0].toString()})], ` +
    `[uint256(${vk.vk_gamma_2[1][1].toString()}),` +
    `uint256(${vk.vk_gamma_2[1][0].toString()})]`
  template = template.replace('<%vk_gamma2%>', vkgamma2)

  const vkdelta2 =
    `[uint256(${vk.vk_delta_2[0][1].toString()}),` +
    `uint256(${vk.vk_delta_2[0][0].toString()})], ` +
    `[uint256(${vk.vk_delta_2[1][1].toString()}),` +
    `uint256(${vk.vk_delta_2[1][0].toString()})]`
  template = template.replace('<%vk_delta2%>', vkdelta2)

  template = template.replace(
    '<%vk_input_length%>',
    (vk.IC.length - 1).toString()
  )
  template = template.replace('<%vk_ic_length%>', vk.IC.length.toString())
  let vi = ''
  for (let i = 0; i < vk.IC.length; i++) {
    if (vi.length !== 0) {
      vi = vi + '        '
    }
    vi =
      vi +
      `vk.IC[${i}] = Pairing.G1Point(uint256(${vk.IC[i][0].toString()}),` +
      `uint256(${vk.IC[i][1].toString()}));\n`
  }
  template = template.replace('<%vk_ic_pts%>', vi)

  return template
}
