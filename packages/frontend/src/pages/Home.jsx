import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import Compose from '../components/Compose'
import CreateGroup from '../components/CreateGroup'
import { SERVER } from '../config'

import state from '../contexts/state'

export default observer(() => {
  const { user, msg, auth } = React.useContext(state)

  const [showingCreatePopup, setShowingCreatePopup] = React.useState(false)

  const transcriptUrl = new URL(`/transcript/${msg.activeChannel}`, SERVER)
  const dummyMsgs = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45,
  ]

  return (
    <div className="container">
      <div style={{ padding: '4px', border: '1px solid black' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
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
            <div style={{ width: '4px' }} />
            <a href={transcriptUrl.toString()} target="_blank">
              transcript
            </a>
          </div>
          <Button onClick={() => setShowingCreatePopup(true)}>
            Create Group
          </Button>
        </div>
        <div style={{ height: '4px' }} />
        <Compose />
      </div>
      <div className="message-grid">
        {dummyMsgs.map((m) => (
          <div className="message">
            <div className="border">{m} - Ceci n’est pas une message.</div>
          </div>
        ))}
      </div >
      <div className="message-grid">
        {msg.messages.map((m) => (
          <div className="message">
            <div className="border" key={m.id}>
              <div>{m.text}</div>
              <div>{m.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
      {showingCreatePopup ? (
        <CreateGroup onDone={() => setShowingCreatePopup(false)} />
      ) : null}
    </div>
  )
})
