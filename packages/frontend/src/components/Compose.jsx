import React from 'react'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'

export default observer(() => {
  const { user, msg, auth } = React.useContext(state)

  const [draft, setDraft] = React.useState('')
  const [proving, setProving] = React.useState(false)
  const [error, setError] = React.useState(null)

  const [errorResetTimer, setErrorResetTimer] = React.useState(null)

  const errorReset = () => {
    if (errorResetTimer) {
      clearTimeout(errorResetTimer)
    }
    setErrorResetTimer(
      setTimeout(() => {
        setErrorResetTimer(null)
        setError(null)
      }, 5000)
    )
  }

  React.useEffect(() => {
    errorReset()
    return () => {
      if (errorResetTimer) clearTimeout(errorResetTimer)
    }
  }, [error])

  const inputRef = React.useRef(null)

  const canSendMessage = !!auth.id && !!auth.addressTree

  return (
    <div style={{}}>
      {!!auth.id ? null : <div>Connect to send a message</div>}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          ref={inputRef}
          style={{ width: '300px' }}
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
