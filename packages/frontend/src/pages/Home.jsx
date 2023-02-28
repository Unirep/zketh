import React from 'react'
import { Link } from 'react-router-dom'
import { observer } from 'mobx-react-lite'
import state from '../contexts/state'
import './home.css'
import Tooltip from '../components/Tooltip'
import Button from '../components/Button'
import MarkdownIt from 'markdown-it'
import Editor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'

const mdParser = new MarkdownIt({
  breaks: true,
  html: false,
  linkify: true,
})

export default observer(() => {
  const { user, msg } = React.useContext(state)

  const mdEditor = React.useRef(null)
  const [draft, setDraft] = React.useState('')

  const handleClick = () => {
    if (mdEditor.current) {
      alert(mdEditor.current.getMdValue())
    }
  }

  const handleEditorChange = ({ html, text }) => {
    const newDraft = text.replace(/\d/g, '')
    console.log(newDraft)
    setDraft(newDraft)
  }

  return (
    <div className="container">
      <div className="title">public anonymous chat for ens owners</div>

      <Editor
        ref={mdEditor}
        style={{ height: '300px' }}
        value={draft}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
      />
      <button onClick={handleClick}>send message</button>
      <div>{draft}</div>

      {/* <div className='flex'>
        <textarea
        className='draft'
        type="text"
        value={draft}
        onKeyPress={async (e) => {
          if (e.charCode != 13) return
          msg.send(draft)
          setDraft('')
        }}
        onChange={(e) => {
          setDraft(e.target.value)
        }}
        />
        <div
          className='draft'
          dangerouslySetInnerHTML={{
              __html: msgHtml,
          }}
        />
      </div> */}

      {msg.messages.map((m) => (
        <div key={m._id}>{m.text}</div>
      ))}
    </div>
  )
})
