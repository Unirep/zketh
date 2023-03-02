import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import Compose from '../components/Compose'
import CreateGroup from '../components/CreateGroup'
import { SERVER } from '../config'
import MessageCell from '../components/MessageCell'

import state from '../contexts/state'

export default observer(() => {
  const { ui, user, msg, auth } = React.useContext(state)

  const [showingCreatePopup, setShowingCreatePopup] = React.useState(false)

  const transcriptUrl = new URL(`/transcript/${msg.activeChannel}`, SERVER)

  return (
    <div className="container">
      <div style={{ padding: '4px', border: '1px solid black' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
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
      {ui.isMobile ? (
        <>
          {msg.messages.map((m) => (
            <MessageCell key={m._id} message={m} />
          ))}
        </>
      ) : (
        <div
          style={{
            maxHeight: '50vh',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            maxWidth: '100vw',
            overflow: 'hidden',
          }}
        >
          {msg.messages.map((m) => (
            <MessageCell key={m._id} message={m} />
          ))}
        </div>
      )}
      {showingCreatePopup ? (
        <CreateGroup onDone={() => setShowingCreatePopup(false)} />
      ) : null}
      <div style={{ flex: 1 }} />
      <div
        style={{
          alignSelf: 'center',
          display: 'flex',
          padding: '8px',
          alignItems: 'center',
        }}
      >
        <img
          src={require('../../public/pse_logo.svg')}
          width="25px"
          style={{ cursor: 'pointer' }}
          onClick={() => window.open('https://appliedzkp.org')}
        />
        <div style={{ margin: '8px' }}>x</div>
        <img
          src={require('../../public/unirep_logo.svg')}
          width="20px"
          style={{ borderRadius: '20px', cursor: 'pointer' }}
          onClick={() => window.open('https://unirep.io')}
        />
      </div>
    </div>
  )
})
