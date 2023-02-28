import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'

import state from '../contexts/state'

export default observer(() => {
  const { user, msg, auth } = React.useContext(state)

  const [draft, setDraft] = React.useState('')
  const [proving, setProving] = React.useState(false)
  const [error, setError] = React.useState(null)

  const inputRef = React.useRef(null)

  return (
    <div className="container">
      <div className="title">public anonymous chat for ens owners</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          disabled={proving}
          onKeyPress={async (e) => {
            if (e.charCode != 13) return
            if (!auth.id) return setError('Connect to send messages')
            try {
              setError(null)
              setProving(true)
              await msg.send(draft)
              setDraft('')
              setProving(false)
              setTimeout(() => inputRef.current.focus(), 1)
            } catch (err) {
              setProving(false)
              setError(err.toString())
            }
          }}
          onChange={(e) => {
            setDraft(e.target.value)
          }}
        />
        <div style={{ width: '4px' }} />
        {proving ? <div>Proving...</div> : null}
        {error ? <div style={{ color: 'red' }}>{error}</div> : null}
      </div>
      {msg.messages.map((m) => (
        <div key={m._id}>{m.text}</div>
      ))}
    </div>
  )
})
