export function formatSize(bytes) {
  if (bytes === undefined || bytes === null) return ''
  const n = Number(bytes)
  if (n === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1)
  return `${(n / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const EXT_ICON = {
  pdf: '\u{1F4C4}',
  doc: '\u{1F4DD}', docx: '\u{1F4DD}',
  xls: '\u{1F4CA}', xlsx: '\u{1F4CA}', csv: '\u{1F4CA}',
  ppt: '\u{1F4CA}', pptx: '\u{1F4CA}',
  jpg: '\u{1F5BC}', jpeg: '\u{1F5BC}', png: '\u{1F5BC}', gif: '\u{1F5BC}', heic: '\u{1F5BC}',
  mp4: '\u{1F3AC}', mov: '\u{1F3AC}', avi: '\u{1F3AC}',
  mp3: '\u{1F3B5}', opus: '\u{1F3B5}', m4a: '\u{1F3B5}', wav: '\u{1F3B5}',
  zip: '\u{1F5C3}', txt: '\u{1F4C3}'
}

export function iconFor(file) {
  if (file.mimeType === 'application/vnd.google-apps.folder') return '\u{1F4C1}'
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  return EXT_ICON[ext] || '\u{1F4C4}'
}

export function isFolder(file) {
  return file.mimeType === 'application/vnd.google-apps.folder'
}
