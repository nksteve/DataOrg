import { formatSize, formatDate } from '../utils'

export default function PreviewModal({ file, onClose }) {
  if (!file) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card preview-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{file.name}</h3>
          <button className="icon-btn" onClick={onClose}>{'✕'}</button>
        </div>
        <div className="preview-body">
          <iframe
            title="Drive preview"
            src={`https://drive.google.com/file/d/${file.id}/preview`}
            allow="autoplay"
          />
        </div>
        <div className="preview-footer">
          <span>{formatSize(file.size)} &middot; modified {formatDate(file.modifiedTime)}</span>
          <a href={file.webViewLink} target="_blank" rel="noreferrer" className="btn">
            Open in Drive
          </a>
        </div>
      </div>
    </div>
  )
}
