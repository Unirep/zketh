import React from 'react'
import { observer } from 'mobx-react-lite'
import './message-cell.css'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export default observer(({ message }) => {
  return (
    <div className="message-cell">
      <div style={{ overflow: 'hidden', maxHeight: '200px' }}>
        {message.text}
      </div>
      <div className="timestamp">{dayjs().to(message.timestamp)}</div>
    </div>
  )
})
