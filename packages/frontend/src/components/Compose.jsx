import React from 'react'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'

export default observer(() => {
  const { user, msg, auth } = React.useContext(state)

  const [draft, setDraft] = React.useState('')
  const [proving, setProving] = React.useState(false)
  const [error, setError] = React.useState(null)

  const inputRef = React.useRef(null)

  const canSendMessage = !!auth.id

  return (
    <div style={{ padding: '4px', border: '1px solid black' }}>
      {canSendMessage ? null : <div>Connect to send a message</div>}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          type="text"
          value={draft}
          disabled={proving || !canSendMessage}
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
    </div>
  )
})
