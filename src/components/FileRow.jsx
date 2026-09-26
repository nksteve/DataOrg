import { useState } from 'react'
import { iconFor, isFolder, formatSize, formatDate } from '../utils'

export default function FileRow({ file, onOpen, onRename, onMove, onDelete, onTag }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [nameDraft, setNameDraft] = useState(file.name)

  function commitRename() {
    setRenaming(false)
    if (nameDraft.trim() && nameDraft !== file.name) onRename(file, nameDraft.trim())
    else setNameDraft(file.name)
  }

  return (
    <div className="file-row">
      <div className="file-main" onClick={() => !renaming && onOpen(file)}>
        <span className="file-icon">{iconFor(file)}</span>
        {renaming ? (
          <input
            autoFocus
            className="rename-input"
            value={nameDraft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') { setNameDraft(file.name); setRenaming(false) }
            }}
          />
        ) : (
          <span className="file-name">{file.name}</span>
        )}
        {file.properties?.category && (
          <span className="tag-pill">{file.properties.category}</span>
        )}
      </div>
      <div className="file-meta">
        {!isFolder(file) && <span className="meta-size">{formatSize(file.size)}</span>}
        <span className="meta-date">{formatDate(file.modifiedTime)}</span>
      </div>
      <div className="file-actions">
        <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}>
          {'⋮'}
        </button>
        {menuOpen && (
          <div className="action-menu" onMouseLeave={() => setMenuOpen(false)}>
            <button onClick={() => { setRenaming(true); setMenuOpen(false) }}>Rename</button>
            <button onClick={() => { onMove(file); setMenuOpen(false) }}>Move to...</button>
            <button onClick={() => {
              const tag = window.prompt('Tag / category', file.properties?.category || '')
              setMenuOpen(false)
              if (tag !== null) onTag(file, tag)
            }}>Tag...</button>
            {!isFolder(file) && (
              <a
                className="menu-link"
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
              >
                Open in Drive
              </a>
            )}
            <button className="danger" onClick={() => { setMenuOpen(false); onDelete(file) }}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
