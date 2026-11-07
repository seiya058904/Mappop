import Vue from 'vue'
import store from '@/store'
import { Loading } from 'element-ui'
import {
  createDocumentSession,
  DRAFT_KEY,
  BACKUP_KEY
} from '@/utils/documentSession.mjs'
import { IMPORT_BYTES, normalizeDocument } from '@/utils/mapDocument.mjs'
import { sanitizeMapData } from '@/utils/sanitizeRichText'

export const saveState = Vue.observable({
  status: 'loading',
  mode: 'browser',
  fileName: '',
  dirty: false,
  issue: '',
  hasBackup: false,
  hasRawRecovery: false
})
export const documentSession = createDocumentSession({
  storage: () => window.localStorage,
  locks: navigator.locks,
  onState: state => {
    Object.assign(saveState, state)
    store.commit('setIsHandleLocalFile', state.mode === 'file')
  }
})

let initialized = null
let documentRequest = 0
export const currentDocument = () =>
  Vue.prototype.getCurrentData
    ? Vue.prototype.getCurrentData()
    : documentSession.snapshot()

export function initializeDocument(fallback) {
  if (window.takeOverApp) return Promise.resolve()
  if (!initialized) {
    initialized = documentSession.initialize(fallback)
    window.addEventListener('storage', event => {
      if (event.key === DRAFT_KEY || event.key === null)
        documentSession.checkRevision()
    })
    window.addEventListener('beforeunload', event => {
      // Capture text still inside the input and any debounced viewport changes.
      // Browser drafts can finish synchronously; pending file writes must warn.
      if (Vue.prototype.getMindMapInstance && !documentSession.isChanging()) {
        Vue.prototype.getMindMapInstance().renderer.textEdit.hideEditTextBox()
        documentSession.update(currentDocument())
      }
      if (!documentSession.hasUnsaved()) return
      event.preventDefault()
      event.returnValue = ''
    })
    // The engine temporarily removes canvas shortcuts while a node is being
    // typed. Saving must still commit that text, including its latest keystroke.
    window.addEventListener(
      'keydown',
      event => {
        if (
          !(event.ctrlKey || event.metaKey) ||
          event.key.toLowerCase() !== 's' ||
          !Vue.prototype.getMindMapInstance
        )
          return
        event.preventDefault()
        event.stopImmediatePropagation()
        if (documentSession.isChanging()) return
        Vue.prototype.getMindMapInstance().renderer.textEdit.hideEditTextBox()
        documentSession.update(currentDocument())
        documentSession.flush().catch(() => {})
      },
      true
    )
    window.addEventListener('pagehide', () => documentSession.release())
    window.addEventListener('pageshow', event => {
      if (event.persisted) documentSession.flush().catch(() => {})
    })
  }
  return initialized
}

async function withPausedEditor(action) {
  if (documentSession.isChanging()) throw new Error('busy')
  const editor = Vue.prototype.getMindMapInstance()
  editor.renderer.textEdit.hideEditTextBox()
  const paused = editor.keyCommand.isPause
  editor.keyCommand.pause()
  const loading = Loading.service({ lock: true })
  try {
    return await action()
  } finally {
    loading.close()
    if (!paused) editor.keyCommand.recovery()
  }
}

export function replaceDocument(data, options = {}) {
  documentRequest++
  return performReplace(data, options)
}

function performReplace(data, options) {
  const next = sanitizeMapData(normalizeDocument(data, currentDocument()))
  if (window.takeOverApp) {
    return withPausedEditor(async () => {
      const previous = currentDocument()
      window.localStorage.setItem(BACKUP_KEY, JSON.stringify(previous))
      saveState.hasBackup = true
      try {
        await Vue.prototype.replaceCurrentData(next)
      } catch (error) {
        await Vue.prototype.replaceCurrentData(previous)
        throw error
      }
    })
  }
  return withPausedEditor(() =>
    documentSession.replace(next, {
      ...options,
      live: currentDocument,
      apply: value => Vue.prototype.replaceCurrentData(value)
    })
  )
}

export async function openDocumentFile(handle) {
  const request = ++documentRequest
  const file = await handle.getFile()
  if (file.size > IMPORT_BYTES) throw new Error('fileTooLarge')
  const data = JSON.parse(await file.text())
  // Parsing and validation must finish before acquiring the new file binding.
  const next = normalizeDocument(data, currentDocument())
  if (request !== documentRequest) return
  await performReplace(next, {
    file: { handle, full: !!data.root },
    isCurrent: () => request === documentRequest
  })
}

export async function saveDocumentAs(handle) {
  documentRequest++
  // Resolve the live snapshot after the picker closes; never reload old storage.
  await withPausedEditor(() => documentSession.saveAs(handle, currentDocument))
}

export function createDocumentFile(handle, data) {
  documentRequest++
  const next = normalizeDocument(data, currentDocument())
  return withPausedEditor(() =>
    documentSession.createFile(handle, next, {
      live: currentDocument,
      apply: value => Vue.prototype.replaceCurrentData(value)
    })
  )
}

export function downloadDocument(raw = false) {
  if (!raw && Vue.prototype.getMindMapInstance)
    Vue.prototype.getMindMapInstance().renderer.textEdit.hideEditTextBox()
  const contents = raw
    ? documentSession.rawRecovery()
    : JSON.stringify(currentDocument())
  const blob = new Blob([contents], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = raw ? 'mappop-recovery.json' : 'mappop-copy.smm'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
