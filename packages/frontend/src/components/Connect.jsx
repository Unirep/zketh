import React, { useState, useEffect } from 'react'
import Button from './Button'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'
import prover from '../contexts/prover'

export default observer(({ text, maxWidth, ...props }) => {
  const { auth, msg } = React.useContext(state)

  const [step, setStep] = React.useState(0)
  const [address, setAddress] = React.useState()
  const [proofLog, setProofLog] = React.useState({})
  const [proofErrored, setProofErrored] = React.useState(false)

  return (
    <div
      style={{
        width: '25rem',
        padding: '8px',
        border: '1px solid black',
      }}
    >
      {step === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            onClick={async () => {
              await auth.getAddresses()
              if (auth.addresses.length === 0) {
                throw new Error('No addresses selected')
              }
              setAddress(auth.addresses[0])
              setStep(20)
              await auth.buildAddressTree()
              setStep(1)
            }}
            loadingText="===> metamask"
          >
            Connect
          </Button>
        </div>
      ) : null}
      {step === 20 ? <div>{'>'} Initializing address tree...</div> : null}
      {step === 1 ? (
        <div>
          <select onChange={(e) => setAddress(e.target.value)}>
            {auth.addresses.map((addr) => (
              <option key={addr} value={addr}>
                {addr}
              </option>
            ))}
          </select>
          <div style={{ height: '1rem' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {auth.addressIndex(address) === -1 ? (
              <div
                style={{ color: 'red', fontSize: '10px', maxWidth: '100px' }}
              >
                Address is not in selected channel
              </div>
            ) : (
              <div />
            )}
            <Button
              onClick={async () => {
                await auth.getProofSignature(address)
                await auth.startUserState()
                prover.warmKeys('proveAddress')
                await auth.userState.waitForSync()
                if (await auth.userState.hasSignedUp()) {
                  setStep(10)
                } else {
                  setStep(2)
                }
              }}
              style={{ fontWeight: 'bold' }}
            >
              Build Key
            </Button>
          </div>
        </div>
      ) : null}
      {step === 2 ? (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            Identity {auth.id.genIdentityCommitment().toString(16).slice(0, 8)}
          </div>
          <div>
            Building an identity proof takes 5-10 minutes. Abort at any time by
            leaving or refreshing the page. Skip this process by signing up
            non-anonymously.
          </div>
          <div style={{ height: '4px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              onClick={async () => {
                setStep(3)
                try {
                  const { sig, sigHash, msgHash } =
                    await auth.getSignupSignature()
                  const { publicSignals, proof } = await auth.buildNonAnonProof(
                    sigHash
                  )
                  setStep(4)
                  await Promise.all([
                    msg.signupNonAnon(sig, msgHash, publicSignals, proof),
                    auth.startUserState(),
                  ])
                  setStep(10)
                } catch (err) {
                  console.log(err)
                  setProofErrored(true)
                }
              }}
            >
              Non-anonymous
            </Button>
            <Button
              onClick={async () => {
                setStep(3)
                try {
                  await auth.proveAddress((data) => {
                    setProofLog((log) => ({
                      ...log,
                      [data.state]: Object.assign(log[data.state] ?? {}, data),
                    }))
                  })
                  setStep(4)
                  await Promise.all([msg.signup(), auth.startUserState()])
                  setStep(10)
                } catch (err) {
                  console.log(err)
                  setProofErrored(true)
                }
              }}
              style={{ fontWeight: 'bold' }}
            >
              Begin
            </Button>
          </div>
        </div>
      ) : null}
      {step === 3 ? (
        <div>
          {Object.entries(proofLog).map(([k, v]) => {
            return (
              <div key={k} style={{ display: 'flex' }}>
                <div>{v.text}</div>
                <div style={{ flex: 1 }} />
                <div>{v.done ? 'done' : v.progress}</div>
              </div>
            )
          })}
          {proofErrored ? <div style={{ color: 'red' }}>error</div> : null}
        </div>
      ) : null}
      {step === 4 ? <div>{'>'} Submitting proof...</div> : null}
      {step === 10 ? (
        <div>
          <div>Authenticated as</div>
          <div style={{ fontSize: '12px' }}>{auth.address}</div>
        </div>
      ) : null}
    </div>
  )
})
