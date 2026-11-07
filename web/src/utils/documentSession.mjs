import { cloneDocument, normalizeDocument } from './mapDocument.mjs'

export const DRAFT_KEY = 'SIMPLE_MIND_MAP_DATA'
export const BACKUP_KEY = 'MAPPOP_PRE_IMPORT_BACKUP'
export const RECOVERY_KEY = 'MAPPOP_DAMAGED_DRAFT'
const LOCK_NAME = 'mappop:browser-draft'

// One editor session owns persistence. UI components can mount/unmount freely.
// Web Locks serializes cooperating tabs; the raw revision check also detects
// writes from an older app version or a page restored from the back/forward cache.
export function createDocumentSession({
  storage,
  locks,
  onState = () => {},
  schedule = setTimeout,
  cancel = clearTimeout
}) {
  const state = {
    status: 'loading',
    mode: 'browser',
    fileName: '',
    dirty: false,
    issue: '',
    hasBackup: false,
    hasRawRecovery: false,
    hadStoredMap: false
  }
  let current,
    expectedRaw = null,
    recoveryRaw = null,
    binding = null
  let damagedDraft = false
  let ownsLock = false,
    releaseLock = null,
    acquiring = null
  let pending = null,
    writing = null,
    timer = null,
    changing = false
  const publish = patch => {
    Object.assign(state, patch)
    onState({ ...state })
  }
  const problem = (issue, status = 'error') => publish({ status, issue })
  const read = key => storage().getItem(key)
  const write = (key, value) => storage().setItem(key, value)
  const errorIssue = error =>
    ['QuotaExceededError', 'NS_ERROR_DOM_QUOTA_REACHED'].includes(error.name)
      ? 'quota'
      : 'storage'

  async function acquire() {
    if (ownsLock) return true
    if (acquiring) return acquiring
    if (!locks || !locks.request) {
      problem('coordination')
      return false
    }
    acquiring = new Promise(resolve => {
      locks
        .request(LOCK_NAME, { ifAvailable: true }, lock => {
          ownsLock = !!lock
          resolve(ownsLock)
          if (lock)
            return new Promise(release => {
              releaseLock = release
            })
        })
        .catch(() => {
          ownsLock = false
          resolve(false)
        })
    })
    const acquired = await acquiring
    acquiring = null
    if (!acquired) problem('otherTab', 'conflict')
    return acquired
  }

  function assertWriter(allowDamaged = false) {
    const raw = read(DRAFT_KEY)
    if (!ownsLock)
      throw new Error(
        state.issue === 'coordination' ? 'coordination' : 'otherTab'
      )
    if (damagedDraft && !allowDamaged) throw new Error('damaged')
    if (raw !== expectedRaw) throw new Error('changedElsewhere')
  }

  function browserFailure(error) {
    const issue = [
      'otherTab',
      'changedElsewhere',
      'coordination',
      'damaged'
    ].includes(error.message)
      ? error.message
      : errorIssue(error)
    problem(
      issue,
      ['otherTab', 'changedElsewhere'].includes(issue) ? 'conflict' : 'error'
    )
  }

  function saveBrowser() {
    try {
      assertWriter()
      const raw = JSON.stringify(current)
      if (raw !== expectedRaw) write(DRAFT_KEY, raw)
      expectedRaw = raw
      publish({ status: 'saved', dirty: false, issue: '' })
      return true
    } catch (error) {
      browserFailure(error)
      return false
    }
  }

  async function writeFile(job) {
    const writable = await job.binding.handle.createWritable()
    try {
      await writable.write(
        JSON.stringify(job.binding.full ? job.data : job.data.root)
      )
      await writable.close()
    } catch (error) {
      if (writable.abort) await writable.abort().catch(() => {})
      throw error
    }
  }

  function flushFile() {
    cancel(timer)
    if (writing) return writing
    writing = (async () => {
      while (pending) {
        const job = pending
        pending = null
        publish({ status: 'saving', dirty: true, issue: '' })
        try {
          await writeFile(job)
        } catch (error) {
          // A newer snapshot of the same file supersedes the failed one.
          if (!pending) pending = job
          problem('fileWrite')
          throw error
        }
      }
      if (binding) publish({ status: 'saved', dirty: false, issue: '' })
    })().finally(() => {
      writing = null
    })
    return writing
  }

  function queueFile() {
    pending = { binding, data: cloneDocument(current) }
    publish({ status: 'saving', dirty: true, issue: '' })
    cancel(timer)
    timer = schedule(() => {
      flushFile().catch(() => {})
    }, 1000)
  }

  return {
    state,
    async initialize(fallback) {
      current = cloneDocument(fallback)
      try {
        expectedRaw = read(DRAFT_KEY)
        state.hadStoredMap = expectedRaw !== null
        state.hasBackup = read(BACKUP_KEY) !== null
        recoveryRaw = read(RECOVERY_KEY)
        if (expectedRaw !== null) {
          try {
            current = normalizeDocument(JSON.parse(expectedRaw), fallback)
          } catch (error) {
            recoveryRaw = expectedRaw
            damagedDraft = true
            publish({ hasRawRecovery: true, status: 'error', issue: 'damaged' })
          }
        }
      } catch (error) {
        problem('storage')
        return cloneDocument(current)
      }
      const acquired = await acquire()
      state.hasRawRecovery = recoveryRaw !== null
      if (damagedDraft) problem('damaged')
      else if (acquired) publish({ status: 'saved', issue: '' })
      return cloneDocument(current)
    },
    snapshot() {
      return cloneDocument(current)
    },
    rawRecovery() {
      return recoveryRaw
    },
    update(partial) {
      if (changing) return
      const next = { ...current, ...partial }
      if (JSON.stringify(next) === JSON.stringify(current)) return
      current = cloneDocument(next)
      publish({ dirty: true })
      if (binding) queueFile()
      else saveBrowser()
    },
    async flush() {
      if (changing) return
      if (binding) return flushFile()
      if (!(await acquire()) || !saveBrowser()) throw new Error(state.issue)
    },
    checkRevision() {
      if (binding || changing) return
      try {
        if (read(DRAFT_KEY) !== expectedRaw)
          problem('changedElsewhere', 'conflict')
      } catch (error) {
        problem('storage')
      }
    },
    hasUnsaved() {
      return state.dirty || changing
    },
    backup(data = current) {
      assertWriter()
      write(BACKUP_KEY, JSON.stringify(data))
      publish({ hasBackup: true })
    },
    async createFile(handle, data, options) {
      if (changing) throw new Error('busy')
      data = normalizeDocument(data, current)
      const file = { handle, full: true }
      return this.replace(data, { ...options, file, create: true })
    },
    readBackup(defaults) {
      return normalizeDocument(JSON.parse(read(BACKUP_KEY)), defaults)
    },
    // Prepare recovery and persistence BEFORE changing the canvas or file mode.
    // An unsuccessful replacement restores the previous binding and document.
    async replace(
      next,
      { apply, live, file = null, create = false, isCurrent = () => true }
    ) {
      if (changing) throw new Error('busy')
      next = normalizeDocument(next, current)
      changing = true
      const previous = cloneDocument(live()),
        previousBinding = binding
      const previousState = { ...state }
      const previousRaw = expectedRaw,
        previousDamaged = damagedDraft
      let previousBackup,
        backupWritten = false,
        wroteDraft = false,
        applied = false
      try {
        if (binding) await flushFile()
        if (!isCurrent()) throw new Error('cancel')
        if (!file) {
          if (!(await acquire())) throw new Error(state.issue)
          assertWriter(true)
          // Explicit recovery may replace a damaged draft only after its exact
          // original bytes have been retained separately. Autosave cannot do it.
          if (damagedDraft) write(RECOVERY_KEY, recoveryRaw)
          // Never consume the previous recovery point merely by opening a file.
          previousBackup = read(BACKUP_KEY)
          write(BACKUP_KEY, JSON.stringify(previous))
          backupWritten = true
          publish({ hasBackup: true })
          if (!isCurrent()) throw new Error('cancel')
          const raw = JSON.stringify(next)
          write(DRAFT_KEY, raw)
          expectedRaw = raw
          wroteDraft = true
          damagedDraft = false
        } else if (create || (!binding && state.dirty)) {
          // A file open must not discard unsaved browser work.
          assertWriter()
          previousBackup = read(BACKUP_KEY)
          write(BACKUP_KEY, JSON.stringify(previous))
          backupWritten = true
          publish({ hasBackup: true })
        }
        if (create) await writeFile({ binding: file, data: next })
        binding = file
        current = next
        publish({
          mode: file ? 'file' : 'browser',
          fileName: file ? file.handle.name : ''
        })
        applied = true
        await apply(cloneDocument(next))
        current = cloneDocument(live())
        if (file) publish({ dirty: false, status: 'saved', issue: '' })
        else {
          publish({ dirty: true })
          saveBrowser()
        }
      } catch (error) {
        const fileWriteFailed = state.issue === 'fileWrite'
        binding = previousBinding
        current = previous
        publish({
          mode: binding ? 'file' : 'browser',
          fileName: binding ? binding.handle.name : ''
        })
        if (applied) await apply(cloneDocument(previous))
        publish({
          dirty: previousState.dirty,
          status: previousState.status,
          issue: previousState.issue
        })
        if (wroteDraft) {
          try {
            assertWriter(true)
            // A valid previous document is recoverable even if there was no draft.
            const raw =
              previousRaw === null ? JSON.stringify(previous) : previousRaw
            write(DRAFT_KEY, raw)
            expectedRaw = raw
          } catch (rollbackError) {
            browserFailure(rollbackError)
          }
        }
        damagedDraft = previousDamaged
        if (backupWritten) {
          try {
            if (read(BACKUP_KEY) === JSON.stringify(previous)) {
              if (previousBackup === null) storage().removeItem(BACKUP_KEY)
              else write(BACKUP_KEY, previousBackup)
              publish({ hasBackup: previousBackup !== null })
            }
          } catch (backupError) {
            /* The current-map recovery point is still valid. */
          }
        }
        if (fileWriteFailed)
          publish({ status: 'error', issue: 'fileWrite', dirty: true })
        else if (
          ['otherTab', 'changedElsewhere', 'coordination'].includes(
            error.message
          )
        )
          browserFailure(error)
        throw error
      } finally {
        changing = false
      }
    },
    async saveAs(handle, live) {
      if (changing) throw new Error('busy')
      changing = true
      try {
        // Wait for the old handle, but permit recovery into a new file if it failed.
        if (binding) await flushFile().catch(() => {})
        const data = cloneDocument(live())
        const nextBinding = { handle, full: true }
        await writeFile({ binding: nextBinding, data })
        cancel(timer)
        pending = null
        binding = nextBinding
        current = data
        publish({
          mode: 'file',
          fileName: handle.name,
          dirty: false,
          status: 'saved',
          issue: ''
        })
      } catch (error) {
        publish({ dirty: true })
        problem('fileWrite')
        throw error
      } finally {
        changing = false
      }
    },
    release() {
      ownsLock = false
      if (releaseLock) releaseLock()
      releaseLock = null
    },
    isChanging() {
      return changing
    }
  }
}
