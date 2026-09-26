import { useCallback, useEffect, useState } from 'react'
import {
  listChildren, renameFile, moveFile, trashFile, createFolder,
  uploadFile, setProperties, searchByName, getPath
} from '../driveApi'
import { isFolder } from '../utils'
import { ROOT_FOLDER_ID, ROOT_FOLDER_NAME } from '../config'
import TreeNode from './TreeNode'
import Breadcrumbs from './Breadcrumbs'
import FileRow from './FileRow'
import PreviewModal from './PreviewModal'
import MoveModal from './MoveModal'
import Toolbar from './Toolbar'

const ROOT_NODE = { id: ROOT_FOLDER_ID, name: ROOT_FOLDER_NAME, mimeType: 'application/vnd.google-apps.folder' }

export default function Explorer({ onSignOut }) {
  const [path, setPath] = useState([{ id: ROOT_FOLDER_ID, name: ROOT_FOLDER_NAME }])
  const [childrenCache, setChildrenCache] = useState({})
  const [expandedIds, setExpandedIds] = useState(new Set([ROOT_FOLDER_ID]))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [moveFileTarget, setMoveFileTarget] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState(null)

  const currentId = path[path.length - 1].id

  const loadFolder = useCallback((folderId) => {
    setLoading(true)
    setError(null)
    listChildren(folderId)
      .then((kids) => setChildrenCache((prev) => ({ ...prev, [folderId]: kids })))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!childrenCache[currentId]) loadFolder(currentId)
  }, [currentId, childrenCache, loadFolder])

  function navigateTo(folderId, name) {
    setPath((p) => [...p, { id: folderId, name }])
    setExpandedIds((prev) => new Set(prev).add(folderId))
    setSearchResults(null)
  }

  function navigateBreadcrumb(index) {
    setPath((p) => p.slice(0, index + 1))
    setSearchResults(null)
  }

  function toggleTreeNode(folderId) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
    if (!childrenCache[folderId]) loadFolder(folderId)
  }

  async function selectFromTree(folderId, name) {
    if (folderId === currentId) return
    const seg = await getPath(folderId, ROOT_FOLDER_ID)
    setPath([{ id: ROOT_FOLDER_ID, name: ROOT_FOLDER_NAME }, ...seg.map((f) => ({ id: f.id, name: f.name }))])
    setSearchResults(null)
  }

  function openFile(file) {
    if (isFolder(file)) navigateTo(file.id, file.name)
    else setPreviewFile(file)
  }

  function refreshCurrent() {
    setChildrenCache((prev) => {
      const next = { ...prev }
      delete next[currentId]
      return next
    })
  }

  async function handleRename(file, newName) {
    try {
      await renameFile(file.id, newName)
      refreshCurrent()
    } catch (e) { setError(e.message) }
  }

  async function handleDelete(file) {
    if (!window.confirm(`Move "${file.name}" to Drive trash? You can restore it from Drive's trash later.`)) return
    try {
      await trashFile(file.id)
      refreshCurrent()
    } catch (e) { setError(e.message) }
  }

  async function handleMoveConfirm(destFolderId) {
    try {
      await moveFile(moveFileTarget.id, destFolderId, currentId)
      setMoveFileTarget(null)
      refreshCurrent()
      setChildrenCache((prev) => {
        const next = { ...prev }
        delete next[destFolderId]
        return next
      })
    } catch (e) { setError(e.message) }
  }

  async function handleTag(file, tag) {
    try {
      await setProperties(file.id, { category: tag })
      refreshCurrent()
    } catch (e) { setError(e.message) }
  }

  async function handleNewFolder(name) {
    try {
      await createFolder(name, currentId)
      refreshCurrent()
    } catch (e) { setError(e.message) }
  }

  async function handleUpload(files) {
    try {
      for (const f of files) await uploadFile(f, currentId)
      refreshCurrent()
    } catch (e) { setError(e.message) }
  }

  async function handleSearch(term) {
    setSearchTerm(term)
    if (!term.trim()) { setSearchResults(null); return }
    try {
      const results = await searchByName(term.trim())
      setSearchResults(results)
    } catch (e) { setError(e.message) }
  }

  const displayed = searchResults !== null ? searchResults : (childrenCache[currentId] || [])

  return (
    <div className="app-shell">
      <aside className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        <div className="sidebar-title">DataOrg</div>
        <TreeNode
          file={ROOT_NODE}
          depth={0}
          expandedIds={expandedIds}
          childrenCache={childrenCache}
          currentFolderId={currentId}
          onToggle={toggleTreeNode}
          onSelect={selectFromTree}
        />
      </aside>
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />
      )}
      <main className="main-pane">
        <Breadcrumbs path={path} onNavigate={navigateBreadcrumb} onToggleSidebar={() => setSidebarOpen((v) => !v)} />
        <Toolbar
          onNewFolder={handleNewFolder}
          onUpload={handleUpload}
          onSearch={handleSearch}
          onSignOut={onSignOut}
        />
        {error && <div className="error-banner" onClick={() => setError(null)}>{error}</div>}
        {searchResults !== null && (
          <div className="search-hint">Search results for "{searchTerm}" &mdash; click a folder result to jump to it</div>
        )}
        <div className="file-list">
          {loading && <div className="empty-hint">Loading...</div>}
          {!loading && displayed.length === 0 && <div className="empty-hint">This folder is empty</div>}
          {displayed.map((file) => (
            <FileRow
              key={file.id}
              file={file}
              onOpen={openFile}
              onRename={handleRename}
              onMove={setMoveFileTarget}
              onDelete={handleDelete}
              onTag={handleTag}
            />
          ))}
        </div>
      </main>
      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      {moveFileTarget && (
        <MoveModal
          file={moveFileTarget}
          onCancel={() => setMoveFileTarget(null)}
          onConfirm={handleMoveConfirm}
        />
      )}
    </div>
  )
}
