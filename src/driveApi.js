import { GOOGLE_CLIENT_ID, DRIVE_SCOPE } from './config'

const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'
const TOKEN_STORAGE_KEY = 'myvault_token'

let tokenClient = null
let onAuthChange = () => {}

function getStoredToken() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed.token || !parsed.expiresAt || Date.now() >= parsed.expiresAt) return null
    return parsed.token
  } catch {
    return null
  }
}

function storeToken(token, expiresInSeconds) {
  localStorage.setItem(
    TOKEN_STORAGE_KEY,
    JSON.stringify({ token, expiresAt: Date.now() + expiresInSeconds * 1000 - 60000 })
  )
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
}

export function initAuth(callback) {
  onAuthChange = callback
  const existing = getStoredToken()
  if (existing) onAuthChange(true)

  const setup = () => {
    if (!window.google) {
      setTimeout(setup, 100)
      return
    }
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (resp) => {
        if (resp.error) {
          onAuthChange(false, resp.error)
          return
        }
        storeToken(resp.access_token, resp.expires_in)
        onAuthChange(true)
      }
    })
  }
  setup()
}

export function signIn() {
  if (!tokenClient) return
  tokenClient.requestAccessToken({ prompt: getStoredToken() ? '' : 'consent' })
}

export function signOut() {
  clearStoredToken()
  onAuthChange(false)
}

export function isSignedIn() {
  return !!getStoredToken()
}

async function authedFetch(url, options = {}) {
  const token = getStoredToken()
  if (!token) {
    signOut()
    throw new Error('Not signed in')
  }
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  })
  if (res.status === 401) {
    clearStoredToken()
    onAuthChange(false)
    throw new Error('Session expired - please sign in again')
  }
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Drive API error ${res.status}: ${body}`)
  }
  return res
}

const FIELDS = 'id,name,mimeType,size,modifiedTime,parents,properties,iconLink,thumbnailLink,webViewLink'

export async function listChildren(folderId) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`)
  const url = `${API_BASE}/files?q=${q}&fields=files(${FIELDS})&orderBy=folder,name_natural&pageSize=1000`
  const res = await authedFetch(url)
  const data = await res.json()
  return data.files || []
}

export async function getFile(fileId) {
  const url = `${API_BASE}/files/${fileId}?fields=${FIELDS}`
  const res = await authedFetch(url)
  return res.json()
}

export async function renameFile(fileId, newName) {
  const url = `${API_BASE}/files/${fileId}?fields=${FIELDS}`
  const res = await authedFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: newName })
  })
  return res.json()
}

export async function moveFile(fileId, newParentId, oldParentId) {
  const url = `${API_BASE}/files/${fileId}?addParents=${newParentId}&removeParents=${oldParentId}&fields=${FIELDS}`
  const res = await authedFetch(url, { method: 'PATCH' })
  return res.json()
}

export async function trashFile(fileId) {
  const url = `${API_BASE}/files/${fileId}`
  await authedFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true })
  })
}

export async function setProperties(fileId, properties) {
  const url = `${API_BASE}/files/${fileId}?fields=${FIELDS}`
  const res = await authedFetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ properties })
  })
  return res.json()
}

export async function createFolder(name, parentId) {
  const url = `${API_BASE}/files?fields=${FIELDS}`
  const res = await authedFetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId]
    })
  })
  return res.json()
}

export async function uploadFile(file, parentId) {
  const metadata = { name: file.name, parents: [parentId] }
  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', file)
  const token = getStoredToken()
  const res = await fetch(`${UPLOAD_BASE}/files?uploadType=multipart&fields=${FIELDS}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
  return res.json()
}

export async function searchByName(term) {
  const q = encodeURIComponent(`name contains '${term.replace(/'/g, "\\'")}' and trashed = false`)
  const url = `${API_BASE}/files?q=${q}&fields=files(${FIELDS})&pageSize=50`
  const res = await authedFetch(url)
  const data = await res.json()
  return data.files || []
}

export async function getPath(fileId, rootId) {
  const path = []
  let current = fileId
  let guard = 0
  while (current && current !== rootId && guard < 20) {
    guard += 1
    const f = await getFile(current)
    path.unshift(f)
    current = f.parents ? f.parents[0] : null
  }
  return path
}

export function isFolder(file) {
  return file.mimeType === 'application/vnd.google-apps.folder'
}
