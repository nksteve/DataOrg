import { useEffect, useState } from 'react'
import { listChildren } from '../driveApi'
import { isFolder } from '../utils'
import { ROOT_FOLDER_ID, ROOT_FOLDER_NAME } from '../config'

export default function MoveModal({ file, onCancel, onConfirm }) {
  const [path, setPath] = useState([{ id: ROOT_FOLDER_ID, name: ROOT_FOLDER_NAME }])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)

  const currentId = path[path.length - 1].id

  useEffect(() => {
    let active = true
    setLoading(true)
    listChildren(currentId).then((kids) => {
      if (!active) return
      setFolders(kids.filter((f) => isFolder(f) && f.id !== file.id))
      setLoading(false)
    })
    return () => { active = false }
  }, [currentId, file.id])

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Move "{file.name}"</h3>
          <button className="icon-btn" onClick={onCancel}>{'✕'}</button>
        </div>
        <div className="move-breadcrumbs">
          {path.map((seg, i) => (
            <span key={seg.id}>
              {i > 0 && ' / '}
              <button className="crumb" onClick={() => setPath(path.slice(0, i + 1))}>
                {seg.name}
              </button>
            </span>
          ))}
        </div>
        <div className="move-list">
          {loading && <div className="empty-hint">Loading...</div>}
          {!loading && folders.length === 0 && <div className="empty-hint">No subfolders here</div>}
          {!loading && folders.map((f) => (
            <div key={f.id} className="move-folder-row" onClick={() => setPath([...path, { id: f.id, name: f.name }])}>
              {'\u{1F4C1}'} {f.name}
            </div>
          ))}
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={() => onConfirm(currentId)}>
            Move here
          </button>
        </div>
      </div>
    </div>
  )
}
