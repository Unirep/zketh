import { createContext } from 'react'
import { makeAutoObservable } from 'mobx'
import { ZkIdentity, Strategy, hash1, stringifyBigInts } from '@unirep/utils'
import { UserState, schema } from '@unirep/core'
import { MemoryConnector } from 'anondb/web'
import { constructSchema } from 'anondb/types'
import { provider, UNIREP_ADDRESS, APP_ADDRESS, SERVER } from '../config'
import prover from './prover'
import poseidon from 'poseidon-lite'

export default class User {
  currentEpoch
  latestTransitionedEpoch
  hasSignedUp = false
  data = []
  provableData = []
  userState = null

  constructor() {
    makeAutoObservable(this)
    this.load()
  }

  async load() {}

  get fieldCount() {
    return this.userState?.sync.settings.fieldCount
  }

  get sumFieldCount() {
    return this.userState?.sync.settings.sumFieldCount
  }

  epochKey(nonce) {
    if (!this.userState) return '0x'
    const epoch = this.userState.sync.calcCurrentEpoch()
    const keys = this.userState.getEpochKeys(epoch)
    const key = keys[nonce]
    return `0x${key.toString(16)}`
  }

  async loadReputation() {
    this.data = await this.userState.getData()
    this.provableData = await this.userState.getProvableData()
  }

  async signup(message) {
    const signupProof = await this.userState.genUserSignUpProof()
    const data = await fetch(`${SERVER}/api/signup`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        publicSignals: signupProof.publicSignals,
        proof: signupProof.proof,
      }),
    }).then((r) => r.json())
    await provider.waitForTransaction(data.hash)
    await this.userState.waitForSync()
    this.hasSignedUp = await this.userState.hasSignedUp()
    this.latestTransitionedEpoch = this.userState.sync.calcCurrentEpoch()
  }
}
