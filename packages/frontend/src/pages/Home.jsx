import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import Compose from '../components/Compose'
import CreateGroup from '../components/CreateGroup'

import state from '../contexts/state'

export default observer(() => {
  const { user, msg, auth } = React.useContext(state)

  const [showingCreatePopup, setShowingCreatePopup] = React.useState(false)

  return (
    <div className="container">
      <div style={{ padding: '4px', border: '1px solid black' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            <select
              onChange={(e) => msg.changeChannel(e.target.value)}
              value={msg.activeChannel}
            >
              {msg.channels.map((channel) => (
                <option key={channel.name} value={channel.name}>
                  {channel.name} - {channel.memberCount} members
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => setShowingCreatePopup(true)}>
            Create Group
          </Button>
        </div>
        <div style={{ height: '4px' }} />
        <Compose />
      </div>
      {msg.messages.map((m) => (
        <div key={m._id}>{m.text}</div>
      ))}
      {showingCreatePopup ? (
        <CreateGroup onDone={() => setShowingCreatePopup(false)} />
      ) : null}
    </div>
  )
})
