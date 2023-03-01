import path from 'path'
import fs from 'fs/promises'
import { Circuit } from '@unirep/circuits'
import * as snarkjs from 'snarkjs'
import url from 'url'
import fetch from 'node-fetch'
import { KEY_SERVER } from '../config.mjs'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const buildPath = path.join(__dirname, `../../keys`)

const vkeyCache = {}

/**
 * The default prover that uses the circuits in default built folder `zksnarkBuild/`
 */
export default {
  /**
   * Verify the snark proof and public signals with `snarkjs.groth16.verify`
   * @param circuitName Name of the circuit, which can be chosen from `Circuit`
   * @param publicSignals The snark public signals that is generated from `genProofAndPublicSignals`
   * @param proof The snark proof that is generated from `genProofAndPublicSignals`
   * @returns True if the proof is valid, false otherwise
   */
  verifyProof: async (circuitName, publicSignals, proof) => {
    let vkey
    if (vkeyCache[circuitName]) {
      vkey = vkeyCache[circuitName]
    } else {
      const url = new URL(`${circuitName}.vkey.json`, KEY_SERVER)
      vkey = await fetch(url.toString()).then((r) => r.json())
      vkeyCache[circuitName] = vkey
    }
    return snarkjs.groth16.verify(vkey, publicSignals, proof)
  },
}
