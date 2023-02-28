import React from 'react'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'
import './create-group.css'
import Button from './Button'

export default observer(({ onDone }) => {
  const { ui, auth } = React.useContext(state)
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
          <div>Addresses, comma separated</div>
          <textarea style={{ resize: 'none', width: 'calc(100% - 8px)' }} />
          <Button>Create</Button>
        </div>
      </div>
    </div>
  )
})
