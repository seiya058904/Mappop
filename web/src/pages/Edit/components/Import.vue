<template>
  <div>
    <el-dialog
      class="nodeImportDialog"
      :title="$t('import.title')"
      :visible.sync="dialogVisible"
      width="480px"
      :close-on-click-modal="!committing"
      :close-on-press-escape="!committing"
      :show-close="!committing"
    >
      <el-upload
        ref="upload"
        action="x"
        :accept="supportFileStr"
        :file-list="fileList"
        :auto-upload="false"
        :multiple="false"
        :on-change="onChange"
        :on-remove="onRemove"
        :limit="1"
        :on-exceed="onExceed"
        :disabled="committing"
      >
        <el-button
          slot="trigger"
          size="small"
          type="primary"
          :disabled="committing"
          >{{ $t('import.selectFile') }}</el-button
        >
        <div slot="tip" class="el-upload__tip">
          {{ $t('import.support') }}{{ supportFileStr }}{{ $t('import.file') }}
        </div>
      </el-upload>
      <p v-if="preparing" role="status">{{ $t('document.preparing') }}</p>
      <p v-if="preparationError" class="importError" role="alert">
        {{ preparationError }}
      </p>
      <section
        v-if="prepared"
        class="importPreview"
        :aria-label="$t('document.preview')"
      >
        <h3>{{ $t('document.preview') }}</h3>
        <p>
          {{
            $t('document.summary', {
              title: prepared.title,
              count: prepared.nodes
            })
          }}
        </p>
        <p>{{ $t('document.protecting') }}</p>
        <p v-if="prepared.multipleRoots">{{ $t('document.multipleRoots') }}</p>
        <ul v-if="prepared.warnings.length" class="importWarnings">
          <li v-for="(warning, index) in prepared.warnings" :key="index">
            {{ warningText(warning) }}
          </li>
        </ul>
        <el-checkbox v-if="prepared.warnings.length" v-model="acknowledged">{{
          $t('document.acknowledge')
        }}</el-checkbox>
      </section>
      <el-button
        v-if="saveState.hasBackup"
        class="restoreBackup"
        size="small"
        :disabled="committing"
        @click="restoreLinkBackup"
        >{{ $t('document.restore') }}</el-button
      >
      <el-button
        v-if="saveState.hasRawRecovery"
        size="small"
        @click="downloadRaw"
        >{{ $t('document.downloadRaw') }}</el-button
      >
      <section
        v-show="!prepared"
        class="aiImportHelp"
        :class="{ isDark: $store.state.localConfig.isDark }"
        aria-labelledby="aiImportTitle"
      >
        <h3 id="aiImportTitle">{{ $t('import.aiTitle') }}</h3>
        <p>{{ $t('import.aiDescription') }}</p>
        <ol>
          <li>{{ $t('import.aiStepPrompt') }}</li>
          <li>{{ $t('import.aiStepSave') }}</li>
          <li>{{ $t('import.aiStepImport') }}</li>
        </ol>
        <el-button size="small" @click="copyAiPrompt">{{
          $t('import.aiCopy')
        }}</el-button>
        <p v-if="copyStatus" class="copyStatus" role="status">
          {{ copyStatus }}
        </p>
        <details ref="promptDetails">
          <summary>{{ $t('import.aiPreview') }}</summary>
          <textarea
            ref="promptText"
            readonly
            rows="7"
            :aria-label="$t('import.aiPreview')"
            :value="$t('import.aiPrompt')"
          ></textarea>
        </details>
      </section>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel" :disabled="committing">{{
          $t('dialog.cancel')
        }}</el-button>
        <el-button
          type="primary"
          @click="confirm"
          :loading="committing"
          :disabled="
            preparing ||
              !prepared ||
              (prepared.warnings.length > 0 && !acknowledged)
          "
          >{{ $t('dialog.confirm') }}</el-button
        >
      </span>
    </el-dialog>
    <el-dialog
      class="xmindCanvasSelectDialog"
      :title="$t('import.xmindCanvasSelectDialogTitle')"
      :visible.sync="xmindCanvasSelectDialogVisible"
      width="300px"
      @close="cancelCanvas"
    >
      <el-radio-group v-model="selectCanvas" class="canvasList">
        <el-radio
          v-for="(item, index) in canvasList"
          :key="index"
          :label="index"
          >{{ item.title }}</el-radio
        >
      </el-radio-group>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancelCanvas">{{ $t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirmSelect">{{
          $t('dialog.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import xmind from 'simple-mind-map/src/parse/xmind.js'
import { mapMutations } from 'vuex'
import Vue from 'vue'
import { parseMarkdownImport } from '@/utils/markdownImport.mjs'
import {
  IMPORT_BYTES,
  normalizeDocument,
  documentSummary
} from '@/utils/mapDocument.mjs'
import {
  documentSession,
  saveState,
  currentDocument,
  replaceDocument,
  downloadDocument
} from '@/api/document'

export default {
  data() {
    return {
      dialogVisible: false,
      copyStatus: '',
      fileList: [],
      prepared: null,
      preparing: false,
      committing: false,
      preparationError: '',
      acknowledged: false,
      preparationSeq: 0,
      selectPromiseResolve: null,
      selectPromiseReject: null,
      xmindCanvasSelectDialogVisible: false,
      selectCanvas: 0,
      canvasList: [],
      editorReady: typeof Vue.prototype.getCurrentData === 'function',
      isDisposed: false,
      importingLink: false,
      hasStoredMap: !!documentSession.state.hadStoredMap,
      saveState
    }
  },
  computed: {
    supportFileStr() {
      return '.smm,.json,.xmind,.md'
    }
  },
  watch: {
    '$route.query.fileURL'(value) {
      if (value) this.handleFileURL()
    },
    dialogVisible(value) {
      if (!value) this.discardPreparation()
    }
  },
  created() {
    this.$bus.$on('showImport', this.handleShowImport)
    this.$bus.$on('handle_file_url', this.handleFileURL)
    this.$bus.$on('importFile', this.handleImportFile)
    this.$bus.$on('setData', this.markLocalMapChanged)
    document.addEventListener('pointerdown', this.markLocalMapChanged, true)
    document.addEventListener('keydown', this.markLocalMapChanged, true)
    this.$bus.$on('mappop_editor_ready', this.onEditorReady)
  },
  beforeDestroy() {
    this.isDisposed = true
    this.discardPreparation()
    if (this.linkController) this.linkController.abort()
    this.$bus.$off('showImport', this.handleShowImport)
    this.$bus.$off('handle_file_url', this.handleFileURL)
    this.$bus.$off('importFile', this.handleImportFile)
    this.$bus.$off('setData', this.markLocalMapChanged)
    document.removeEventListener('pointerdown', this.markLocalMapChanged, true)
    document.removeEventListener('keydown', this.markLocalMapChanged, true)
    this.$bus.$off('mappop_editor_ready', this.onEditorReady)
  },
  methods: {
    ...mapMutations(['setActiveSidebar']),
    downloadRaw() {
      downloadDocument(true)
    },
    async copyAiPrompt() {
      try {
        await navigator.clipboard.writeText(this.$t('import.aiPrompt'))
        this.copyStatus = this.$t('import.aiCopied')
      } catch (error) {
        this.copyStatus = this.$t('import.aiCopyFailed')
        this.$refs.promptDetails.open = true
        await this.$nextTick()
        this.$refs.promptText.focus()
        this.$refs.promptText.select()
      }
    },
    markLocalMapChanged() {
      this.hasStoredMap = true
    },
    onEditorReady() {
      this.editorReady = true
      if (this.$route.query.fileURL) this.handleFileURL()
    },
    handleShowImport() {
      this.dialogVisible = true
    },
    getRegexp() {
      return /\.(smm|json|xmind|md)$/i
    },
    warningText(warning) {
      const key = `document.types.${warning.type}`
      return this.$t('document.skipped', {
        line: warning.line,
        type: this.$te(key) ? this.$t(key) : warning.type
      })
    },
    errorText(error) {
      if (
        [
          'QuotaExceededError',
          'NS_ERROR_DOM_QUOTA_REACHED',
          'SecurityError'
        ].includes(error.name)
      )
        return this.$t('document.backupFailed')
      const key = `document.${error.message}`
      return this.$te(key) ? this.$t(key) : this.$t('document.importFailed')
    },
    async prepareFile(file, name, isCurrent = () => !this.isDisposed) {
      if (file.size > IMPORT_BYTES) throw new Error('fileTooLarge')
      const type = this.getRegexp().exec(name)
      if (!type) throw new Error('invalidDocument')
      let result = { warnings: [], multipleRoots: false }
      if (type[1].toLowerCase() === 'md') {
        result = parseMarkdownImport(
          await file.text(),
          name.replace(/\.[^.]+$/, '')
        )
      } else if (type[1].toLowerCase() === 'xmind') {
        result.data = await xmind.parseXmindFile(file, content => {
          if (!isCurrent()) throw new Error('cancel')
          this.canvasList = content
          this.selectCanvas = 0
          this.xmindCanvasSelectDialogVisible = true
          return new Promise((resolve, reject) => {
            this.selectPromiseResolve = resolve
            this.selectPromiseReject = reject
          })
        })
      } else
        result.data = JSON.parse((await file.text()).replace(/^\uFEFF/, ''))
      result.data = normalizeDocument(result.data, currentDocument())
      const summary = documentSummary(result.data)
      const title = document.createElement('template')
      title.innerHTML = summary.title
      result.title = result.data.root.data.richText
        ? title.content.textContent
        : summary.title
      result.nodes = summary.nodes
      return result
    },
    async handleFileURL() {
      const fileURL = this.$route.query.fileURL
      if (
        !fileURL ||
        this.importingLink ||
        !this.editorReady ||
        this.isDisposed
      )
        return
      this.importingLink = true
      const controller = new AbortController()
      this.linkController = controller
      const timeout = setTimeout(() => controller.abort(), 15000)
      const isCurrent = () =>
        !this.isDisposed && this.$route.query.fileURL === fileURL
      try {
        const url = new URL(fileURL, window.location.origin)
        if (!['http:', 'https:'].includes(url.protocol))
          throw new Error('Only HTTP or HTTPS import links are supported.')
        if (!this.getRegexp().test(url.pathname))
          throw new Error(
            'The import link must end in .md, .smm, .json or .xmind.'
          )
        const res = await fetch(url.href, {
          signal: controller.signal,
          credentials: 'omit',
          referrerPolicy: 'no-referrer'
        })
        if (!res.ok)
          throw new Error(`This map could not be opened (HTTP ${res.status}).`)
        if (Number(res.headers.get('Content-Length')) > IMPORT_BYTES)
          throw new Error('fileTooLarge')
        const reader = res.body.getReader(),
          chunks = []
        let size = 0
        for (
          let chunk = await reader.read();
          !chunk.done;
          chunk = await reader.read()
        ) {
          size += chunk.value.byteLength
          if (size > IMPORT_BYTES) {
            await reader.cancel()
            throw new Error('fileTooLarge')
          }
          chunks.push(chunk.value)
        }
        clearTimeout(timeout)
        if (!isCurrent()) return
        const prepared = await this.prepareFile(
          new Blob(chunks),
          decodeURIComponent(url.pathname.split('/').pop()),
          isCurrent
        )
        if (!isCurrent()) return
        if (
          this.hasStoredMap ||
          this.$store.state.isHandleLocalFile ||
          prepared.warnings.length ||
          prepared.multipleRoots
        ) {
          const details = [
            this.$t('document.summary', {
              title: prepared.title,
              count: prepared.nodes
            }),
            prepared.multipleRoots ? this.$t('document.multipleRoots') : '',
            ...prepared.warnings.map(this.warningText)
          ]
            .filter(Boolean)
            .join('\n')
          await this.$confirm(
            `Open this shared draft? Your current map will be backed up on this device. You can restore it from Import. Edits to the draft are saved locally; they do not change the shared link.\n${details}`,
            'Protect your current map',
            {
              confirmButtonText: 'Back up & open',
              cancelButtonText: 'Keep my map',
              closeOnClickModal: false,
              type: 'warning'
            }
          )
        }
        if (!isCurrent()) return
        await replaceDocument(prepared.data, { isCurrent })
        this.hasStoredMap = true
        await this.clearFileURL(fileURL)
        this.$message.success(
          this.saveState.status === 'saved'
            ? 'Shared draft opened. Your edits save on this device.'
            : this.$t('import.importSuccess')
        )
      } catch (error) {
        if (this.isDisposed) return
        if (
          error === 'cancel' ||
          error === 'close' ||
          error.message === 'cancel'
        )
          await this.clearFileURL(fileURL)
        else if (isCurrent())
          this.$message.error(
            error.name === 'AbortError'
              ? 'The import timed out. Your current map is safe.'
              : /^(This map could|Only HTTP|The import link)/.test(
                  error.message
                )
              ? error.message
              : this.errorText(error)
          )
      } finally {
        clearTimeout(timeout)
        this.importingLink = false
        this.linkController = null
        if (
          !this.isDisposed &&
          this.$route.query.fileURL &&
          this.$route.query.fileURL !== fileURL
        )
          this.$nextTick(this.handleFileURL)
      }
    },
    clearFileURL(expected) {
      if (this.$route.query.fileURL !== expected) return Promise.resolve()
      const query = { ...this.$route.query }
      delete query.fileURL
      return this.$router.replace({ path: this.$route.path, query })
    },
    async restoreLinkBackup() {
      try {
        const backup = documentSession.readBackup(currentDocument())
        await this.$confirm(
          this.$t('document.restoreQuestion'),
          this.$t('document.restoreTitle'),
          {
            type: 'warning',
            confirmButtonText:
              this.$i18n.locale === 'en'
                ? 'Restore'
                : this.$t('dialog.confirm'),
            cancelButtonText: this.$t('dialog.cancel')
          }
        )
        await replaceDocument(backup)
        this.cancel()
        this.$message.success(this.$t('document.restored'))
      } catch (error) {
        if (error !== 'cancel' && error !== 'close')
          this.$message.error(this.errorText(error))
      }
    },
    async onChange(file) {
      this.discardPreparation()
      const seq = this.preparationSeq
      this.fileList = [file]
      this.preparing = true
      try {
        const prepared = await this.prepareFile(
          file.raw,
          file.name,
          () => seq === this.preparationSeq && !this.isDisposed
        )
        if (seq === this.preparationSeq && !this.isDisposed)
          this.prepared = prepared
      } catch (error) {
        if (
          seq === this.preparationSeq &&
          !this.isDisposed &&
          error.message !== 'cancel'
        )
          this.preparationError = this.errorText(error)
      } finally {
        if (seq === this.preparationSeq) this.preparing = false
      }
    },
    onRemove() {
      this.discardPreparation()
    },
    onExceed() {
      this.$message.error(this.$t('import.maxFileNum'))
    },
    discardPreparation() {
      this.preparationSeq++
      this.fileList = []
      this.prepared = null
      this.preparing = false
      this.preparationError = ''
      this.acknowledged = false
      this.copyStatus = ''
      this.cancelCanvas()
      if (this.$refs.promptDetails) this.$refs.promptDetails.open = false
    },
    cancel() {
      if (!this.committing) this.dialogVisible = false
    },
    async confirm() {
      if (
        !this.prepared ||
        this.preparing ||
        this.committing ||
        (this.prepared.warnings.length && !this.acknowledged)
      )
        return
      const seq = this.preparationSeq
      this.committing = true
      try {
        await replaceDocument(this.prepared.data, {
          isCurrent: () =>
            !this.isDisposed &&
            seq === this.preparationSeq &&
            this.dialogVisible
        })
        this.hasStoredMap = true
        this.dialogVisible = false
        this.setActiveSidebar(null)
        this.$message.success(this.$t('import.importSuccess'))
      } catch (error) {
        if (error.message !== 'cancel')
          this.preparationError = this.errorText(error)
      } finally {
        this.committing = false
      }
    },
    confirmSelect() {
      const resolve = this.selectPromiseResolve
      this.selectPromiseResolve = null
      this.selectPromiseReject = null
      if (resolve) resolve(this.canvasList[this.selectCanvas])
      this.xmindCanvasSelectDialogVisible = false
    },
    cancelCanvas() {
      const reject = this.selectPromiseReject
      this.selectPromiseResolve = null
      this.selectPromiseReject = null
      if (reject) reject(new Error('cancel'))
      this.xmindCanvasSelectDialogVisible = false
    },
    handleImportFile(file) {
      this.dialogVisible = true
      this.onChange({ raw: file, name: file.name })
    }
  }
}
</script>

<style lang="less" scoped>
.nodeImportDialog {
  /deep/ .el-dialog {
    max-width: calc(100vw - 32px);
    max-height: calc(85vh - 16px);
    display: flex;
    flex-direction: column;
  }
  /deep/ .el-dialog__header,
  /deep/ .el-dialog__footer {
    flex-shrink: 0;
  }
  /deep/ .el-dialog__body {
    overflow-y: auto;
    word-break: normal;
  }
  .importPreview {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #9b94a0;
    line-height: 1.6;
    overflow-wrap: anywhere;
    h3 {
      margin: 0 0 8px;
      font-size: 16px;
    }
    p {
      margin: 8px 0;
    }
    /deep/ .el-checkbox {
      display: flex;
      align-items: baseline;
    }
    /deep/ .el-checkbox__label {
      white-space: normal;
    }
  }
  .importWarnings {
    max-height: 150px;
    overflow: auto;
    padding-left: 24px;
  }
  .importError {
    color: #ad362a;
    line-height: 1.6;
  }
  /deep/ .el-dialog__body {
    padding-top: 20px;
    padding-bottom: 20px;
  }
  .restoreBackup {
    margin-top: 20px;
  }
  .aiImportHelp {
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #dcdfe6;
    line-height: 1.6;
    word-break: normal;
    overflow-wrap: break-word;
    &.isDark {
      color: #dbe2e9;
      border-color: #53606c;
      textarea {
        border-color: #53606c;
      }
    }
    h3 {
      margin: 0 0 8px;
      font-size: 16px;
      color: inherit;
    }
    p {
      margin: 0 0 12px;
    }
    ol {
      margin: 0 0 16px;
      padding-left: 22px;
    }
    li + li {
      margin-top: 6px;
    }
    .copyStatus {
      margin-top: 10px;
    }
    details {
      margin-top: 14px;
    }
    summary {
      cursor: pointer;
      width: fit-content;
    }
    summary:focus-visible,
    textarea:focus-visible {
      outline: 2px solid #409eff;
      outline-offset: 3px;
    }
    textarea {
      display: block;
      width: 100%;
      box-sizing: border-box;
      margin-top: 10px;
      padding: 10px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background: transparent;
      color: inherit;
      font: inherit;
      line-height: 1.6;
      resize: vertical;
    }
  }
}

.canvasList {
  display: flex;
  flex-direction: column;

  /deep/ .el-radio {
    margin-bottom: 12px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }
}
</style>
