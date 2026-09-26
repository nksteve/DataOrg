export default function Breadcrumbs({ path, onNavigate, onToggleSidebar }) {
  return (
    <div className="breadcrumbs">
      <button className="icon-btn sidebar-toggle" onClick={onToggleSidebar} aria-label="Toggle folders">
        {'☰'}
      </button>
      {path.map((seg, i) => (
        <span key={seg.id} className="crumb-wrap">
          {i > 0 && <span className="crumb-sep">/</span>}
          <button className="crumb" onClick={() => onNavigate(i)}>{seg.name}</button>
        </span>
      ))}
    </div>
  )
}
