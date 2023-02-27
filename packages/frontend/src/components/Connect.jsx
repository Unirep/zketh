import React, { useState, useEffect } from 'react'
import Button from './Button'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'

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
              setStep(1)
            }}
            loadingText="===> metamask"
          >
            Connect
          </Button>
        </div>
      ) : null}
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
            <Button
              loadingText="====> metamask"
              onClick={() => auth.reloadAddresses()}
            >
              Reload Accounts
            </Button>
            <Button
              onClick={async () => {
                await auth.getProofSignature(address)
                setStep(2)
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
            Building an identity proof takes 1-2 minutes. Abort at any time by
            leaving or refreshing the page.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                  await msg.signup()
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
      {step === 4 ? <div>Submitting proof</div> : null}
    </div>
  )
})
