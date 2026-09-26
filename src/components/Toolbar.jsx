import { useRef, useState } from 'react'

export default function Toolbar({ onNewFolder, onUpload, onSearch, onSignOut }) {
  const fileInputRef = useRef(null)
  const [term, setTerm] = useState('')

  return (
    <div className="toolbar">
      <input
        className="search-input"
        placeholder="Search DataOrg..."
        value={term}
        onChange={(e) => {
          setTerm(e.target.value)
          onSearch(e.target.value)
        }}
      />
      <button className="btn" onClick={() => {
        const name = window.prompt('New folder name')
        if (name && name.trim()) onNewFolder(name.trim())
      }}>
        + Folder
      </button>
      <button className="btn" onClick={() => fileInputRef.current?.click()}>
        Upload
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files.length) onUpload(Array.from(e.target.files))
          e.target.value = ''
        }}
      />
      <button className="btn ghost" onClick={onSignOut}>Sign out</button>
    </div>
  )
}
