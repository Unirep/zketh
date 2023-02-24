import React from 'react'
import { Link } from "react-router-dom";
import { observer } from 'mobx-react-lite'
import './home.css'
import Tooltip from '../components/Tooltip';
import Button from '../components/Button'

import state from '../contexts/state'

export default observer(() => {
    const { user, msg } = React.useContext(state)

    // if (!user.userState) {
    //     return (
    //     <div className="container">
    //         Loading...
    //     </div>
    //     )
    // }

    return (
        <div className="container">
            <div className="title">public anonymous chat for ens owners</div>
            {msg.messages.map(m => (
                <div>
                    {m.name}
                </div>
            ))}
        </div>

    )
})
