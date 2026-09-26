import { isFolder } from '../utils'

export default function TreeNode({
  file, depth, expandedIds, childrenCache, currentFolderId,
  onToggle, onSelect
}) {
  if (!isFolder(file)) return null
  const expanded = expandedIds.has(file.id)
  const kids = (childrenCache[file.id] || []).filter(isFolder)
  const isActive = file.id === currentFolderId

  return (
    <div className="tree-node">
      <div
        className={`tree-row${isActive ? ' active' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <span
          className={`tree-caret${kids.length || !childrenCache[file.id] ? '' : ' empty'}`}
          onClick={() => onToggle(file.id)}
        >
          {expanded ? '▾' : '▸'}
        </span>
        <span className="tree-label" onClick={() => onSelect(file.id, file.name)}>
          {file.name}
        </span>
      </div>
      {expanded && kids.map((child) => (
        <TreeNode
          key={child.id}
          file={child}
          depth={depth + 1}
          expandedIds={expandedIds}
          childrenCache={childrenCache}
          currentFolderId={currentFolderId}
          onToggle={onToggle}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}
