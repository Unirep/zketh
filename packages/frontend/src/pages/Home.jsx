import React from 'react'
import { Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip';
import Button from '../components/Button'

import state from '../contexts/state'

export default observer(() => {
    const { user, msg } = React.useContext(state)

    const [draft, setDraft] = React.useState('')

    return (
        <div className="container">
            <div className="title">public anonymous chat for ens owners</div>
            <input type="text"
            value={draft}
            onKeyPress={async (e) => {
                if (e.charCode != 13) return
                msg.send(draft)
                setDraft('')
            }}
            onChange={(e) => {
                setDraft(e.target.value)
            }} />
            {msg.messages.map(m => (
                <div key={m._id}>
                    {m.text}
                </div>
            ))}
        </div>

    )
})
