import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import './header.css'
import state from '../contexts/state'

export default observer(() => {
  const { msg } = React.useContext(state)
  return (
    <>
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              background: msg.connected ? 'green' : 'red',
              borderRadius: '10px',
            }}
          />
          <div style={{ width: '4px' }} />
          <div style={{ fontSize: '12px' }}>
            {msg.connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
        <div className="links">
          <a href="https://developer.unirep.io/" target="blank">
            Docs
          </a>
          <a href="https://github.com/Unirep" target="blank">
            GitHub
          </a>
          <a href="https://discord.com/invite/VzMMDJmYc5" target="blank">
            Discord
          </a>
        </div>
      </div>

      <Outlet />
    </>
  )
})
