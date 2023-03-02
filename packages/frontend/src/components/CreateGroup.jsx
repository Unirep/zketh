import React from 'react'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'
import './create-group.css'
import Button from './Button'

export default observer(({ onDone }) => {
  const { ui, msg, auth } = React.useContext(state)
  const [addresses, setAddresses] = React.useState('')
  const [name, setName] = React.useState('')
  const [nameValid, setNameValid] = React.useState(null)
  return (
    <div className="popup-out">
      <div className="popup-inner">
        <div
          style={{
            display: 'flex',
            flex: 1,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ fontWeight: 'bold' }}>Create Channel</div>
          <div style={{ flex: 1 }} />
          <Button style={{ fontSize: '12px' }} onClick={() => onDone()}>
            x
          </Button>
        </div>
        <div style={{ height: '4px' }} />
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
          <div>Addresses, one per line</div>
          <textarea
            style={{ resize: 'none', width: 'calc(100% - 8px)' }}
            onChange={(e) => {
              setAddresses(e.target.value)
            }}
            value={addresses}
          />
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <input
              placeholder="name"
              type="text"
              onChange={async (e) => {
                setName(e.target.value)
                const valid = await msg.checkChannelName(e.target.value)
                setNameValid(valid)
              }}
              value={name}
            />
            {nameValid !== null ? (
              <div
                style={{
                  width: '10px',
                  height: '10px',
                  background: nameValid ? 'green' : 'red',
                  borderRadius: '10px',
                }}
              />
            ) : null}
          </div>
          <Button
            onClick={async () => {
              await msg.createChannel(name, addresses)
              await msg.loadChannels()
              await msg.changeChannel(name)
              onDone()
            }}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  )
})
