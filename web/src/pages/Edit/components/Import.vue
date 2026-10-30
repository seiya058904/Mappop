<template>
  <div>
    <el-dialog
      class="nodeImportDialog"
      :title="$t('import.title')"
      :visible.sync="dialogVisible"
      width="480px"
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
      >
        <el-button slot="trigger" size="small" type="primary">{{
          $t('import.selectFile')
        }}</el-button>
        <div slot="tip" class="el-upload__tip">
          {{ $t('import.support') }}{{ supportFileStr }}{{ $t('import.file') }}
        </div>
      </el-upload>
      <el-button v-if="hasLinkBackup" class="restoreBackup" size="small" @click="restoreLinkBackup">
        Restore pre-import backup
      </el-button>
      <section class="aiImportHelp" :class="{ isDark: $store.state.localConfig.isDark }" aria-labelledby="aiImportTitle">
        <h3 id="aiImportTitle">{{ $t('import.aiTitle') }}</h3>
        <p>{{ $t('import.aiDescription') }}</p>
        <ol>
          <li>{{ $t('import.aiStepPrompt') }}</li>
          <li>{{ $t('import.aiStepSave') }}</li>
          <li>{{ $t('import.aiStepImport') }}</li>
        </ol>
        <el-button size="small" @click="copyAiPrompt">{{ $t('import.aiCopy') }}</el-button>
        <p v-if="copyStatus" class="copyStatus" role="status">{{ copyStatus }}</p>
        <details ref="promptDetails">
          <summary>{{ $t('import.aiPreview') }}</summary>
          <textarea ref="promptText" readonly rows="7" :aria-label="$t('import.aiPreview')" :value="$t('import.aiPrompt')"></textarea>
        </details>
      </section>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">{{ $t('dialog.cancel') }}</el-button>
        <el-button type="primary" @click="confirm">{{
          $t('dialog.confirm')
        }}</el-button>
      </span>
    </el-dialog>
    <el-dialog
      class="xmindCanvasSelectDialog"
      :title="$t('import.xmindCanvasSelectDialogTitle')"
      :visible.sync="xmindCanvasSelectDialogVisible"
      width="300px"
      :show-close="false"
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
        <el-button type="primary" @click="confirmSelect">{{
          $t('dialog.confirm')
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import xmind from 'simple-mind-map/src/parse/xmind.js'
import markdown from 'simple-mind-map/src/parse/markdown.js'
import { mapMutations } from 'vuex'
import Vue from 'vue'

// 导入
export default {
  data() {
    return {
      dialogVisible: false,
      copyStatus: '',
      fileList: [],
      selectPromiseResolve: null,
      xmindCanvasSelectDialogVisible: false,
      selectCanvas: '',
      canvasList: [],
      mdStr: '',
      editorReady: typeof Vue.prototype.getCurrentData === 'function',
      isDisposed: false,
      importingLink: false,
      hasStoredMap: localStorage.getItem('SIMPLE_MIND_MAP_DATA') !== null,
      hasLinkBackup: localStorage.getItem('MAPPOP_PRE_IMPORT_BACKUP') !== null
    }
  },
  computed: {
    supportFileStr() {
      return '.smm,.json,.xmind,.md'
    }
  },
  watch: {
    '$route.query.fileURL'(value) {
      if (value) {
        this.hasStoredMap = this.hasStoredMap || localStorage.getItem('SIMPLE_MIND_MAP_DATA') !== null
        this.handleFileURL()
      }
    },
    dialogVisible(val, oldVal) {
      if (!val && oldVal) {
        this.fileList = []
        this.copyStatus = ''
        if (this.$refs.promptDetails) this.$refs.promptDetails.open = false
      }
    }
  },
  created() {
    this.$bus.$on('showImport', this.handleShowImport)
    this.$bus.$on('handle_file_url', this.handleFileURL)
    this.$bus.$on('importFile', this.handleImportFile)
    this.$bus.$on('setData', this.markLocalMapChanged)
    // Initial render also emits data_change. Track real interaction instead so
    // a first-time share link opens automatically, while edits during fetch are protected.
    document.addEventListener('pointerdown', this.markLocalMapChanged, true)
    document.addEventListener('keydown', this.markLocalMapChanged, true)
    this.$bus.$on('mappop_editor_ready', this.onEditorReady)
  },
  beforeDestroy() {
    this.isDisposed = true
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

    // Keep the existing Markdown parser and setData pipeline. Resolve the file
    // before replacing anything, and keep an explicit recovery point locally.
    async handleFileURL() {
      const fileURL = this.$route.query.fileURL
      if (!fileURL || this.importingLink || !this.editorReady || this.isDisposed) return
      this.importingLink = true
      const controller = new AbortController()
      this.linkController = controller
      const timeout = setTimeout(() => controller.abort(), 15000)
      try {
        const url = new URL(fileURL, window.location.origin)
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Only HTTP or HTTPS import links are supported.')
        }
        const match = /\.(smm|json|xmind|md)$/i.exec(url.pathname)
        if (!match) throw new Error('The import link must end in .md, .smm, .json or .xmind.')
        const res = await fetch(url.href, { signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
        if (!res.ok) throw new Error(`This map could not be opened (HTTP ${res.status}).`)
        const limit = 10 * 1024 * 1024
        if (Number(res.headers.get('Content-Length')) > limit) throw new Error('Import files must be smaller than 10 MiB.')
        const reader = res.body.getReader()
        const chunks = []
        let size = 0
        for (let chunk = await reader.read(); !chunk.done; chunk = await reader.read()) {
          const { value } = chunk
          size += value.byteLength
          if (size > limit) {
            await reader.cancel()
            throw new Error('Import files must be smaller than 10 MiB.')
          }
          chunks.push(value)
        }
        const file = new Blob(chunks)
        const type = match[1].toLowerCase()
        let data
        if (type === 'md') {
          data = markdown.transformMarkdownTo(await file.text())
        } else if (type === 'xmind') {
          data = await xmind.parseXmindFile(file, content => {
            this.showSelectXmindCanvasDialog(content)
            return new Promise(resolve => { this.selectPromiseResolve = resolve })
          })
        } else {
          data = JSON.parse(await file.text())
        }
        if (!data || !(data.root || data).data) throw new Error('The file does not contain a valid mind map.')
        if (this.isDisposed || this.$route.query.fileURL !== fileURL) return
        if (this.hasStoredMap || this.$store.state.isHandleLocalFile) {
          await this.$confirm(
            'Open this shared draft? Your current map will be backed up on this device. You can restore it from Import. Edits to the draft are saved locally; they do not change the shared link.',
            'Protect your current map',
            { confirmButtonText: 'Back up & open', cancelButtonText: 'Keep my map', closeOnClickModal: false, type: 'warning' }
          )
          if (this.isDisposed || this.$route.query.fileURL !== fileURL) return
          const current = Vue.prototype.getCurrentData()
          // If storage is full, abort rather than overwrite unprotected work.
          localStorage.setItem('MAPPOP_PRE_IMPORT_BACKUP', JSON.stringify(current))
          this.hasLinkBackup = true
        }
        this.$store.commit('setIsHandleLocalFile', false)
        this.$bus.$emit('setData', data)
        this.hasStoredMap = true
        await this.clearFileURL(fileURL)
        this.$message.success('Shared draft opened. Your edits save on this device.')
      } catch (error) {
        if (this.isDisposed) return
        if (error === 'cancel' || error === 'close') {
          await this.clearFileURL(fileURL)
        } else {
          if (this.$route.query.fileURL === fileURL) this.$message.error(error.name === 'AbortError' ? 'The import timed out. Your current map is safe.' : (error.message || 'Import failed. Your current map is safe.'))
        }
      } finally {
        clearTimeout(timeout)
        this.importingLink = false
        this.linkController = null
        if (!this.isDisposed && this.$route.query.fileURL && this.$route.query.fileURL !== fileURL) {
          this.$nextTick(this.handleFileURL)
        }
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
        const backup = JSON.parse(localStorage.getItem('MAPPOP_PRE_IMPORT_BACKUP'))
        if (!backup || !backup.root) throw new Error('No valid backup is available.')
        await this.$confirm('Restore the map saved before the last shared link import? Export your current map first if you want to keep both.', 'Restore backup', { type: 'warning', confirmButtonText: 'Restore', cancelButtonText: 'Cancel' })
        this.$store.commit('setIsHandleLocalFile', false)
        this.$bus.$emit('setData', backup)
        this.cancel()
        this.$message.success('Pre-import map restored.')
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') this.$message.error(error.message || 'Backup could not be restored.')
      }
    },

    // 文件选择
    onChange(file) {
      if (!this.getRegexp().test(file.name)) {
        this.$message.error(
          this.$t('import.pleaseSelect') +
            this.supportFileStr +
            this.$t('import.file')
        )
        this.fileList = []
      } else {
        this.fileList.push(file)
      }
    },

    // 移除文件
    onRemove(file, fileList) {
      this.fileList = fileList
    },

    // 数量超出限制
    onExceed() {
      this.$message.error(this.$t('import.maxFileNum'))
    },

    // 取消
    cancel() {
      this.dialogVisible = false
    },

    // 确定
    confirm() {
      if (this.fileList.length <= 0) {
        return this.$message.error(this.$t('import.notSelectTip'))
      }
      this.$store.commit('setIsHandleLocalFile', false)
      let file = this.fileList[0]
      if (/\.(smm|json)$/i.test(file.name)) {
        this.handleSmm(file)
      } else if (/\.xmind$/i.test(file.name)) {
        this.handleXmind(file)
      } else if (/\.md$/i.test(file.name)) {
        this.handleMd(file)
      }
      this.cancel()
      this.setActiveSidebar(null)
    },

    // 处理.smm文件
    handleSmm(file) {
      let fileReader = new FileReader()
      fileReader.readAsText(file.raw)
      fileReader.onload = evt => {
        try {
          let data = JSON.parse(evt.target.result)
          if (typeof data !== 'object') {
            throw new Error(this.$t('import.fileContentError'))
          }
          this.$bus.$emit('setData', data)
          this.$message.success(this.$t('import.importSuccess'))
        } catch (error) {
          console.log(error)
          this.$message.error(this.$t('import.fileParsingFailed'))
        }
      }
    },

    // 处理.xmind文件
    async handleXmind(file) {
      try {
        let data = await xmind.parseXmindFile(file.raw, content => {
          this.showSelectXmindCanvasDialog(content)
          return new Promise(resolve => {
            this.selectPromiseResolve = resolve
          })
        })
        this.$bus.$emit('setData', data)
        this.$message.success(this.$t('import.importSuccess'))
      } catch (error) {
        console.log(error)
        this.$message.error(this.$t('import.fileParsingFailed'))
      }
    },

    // 显示xmind文件的多个画布选择弹窗
    showSelectXmindCanvasDialog(content) {
      this.canvasList = content
      this.selectCanvas = 0
      this.xmindCanvasSelectDialogVisible = true
    },

    // 确认导入指定的画布
    confirmSelect() {
      this.selectPromiseResolve(this.canvasList[this.selectCanvas])
      this.xmindCanvasSelectDialogVisible = false
      this.canvasList = []
      this.selectCanvas = 0
    },

    // 处理markdown文件
    async handleMd(file) {
      let fileReader = new FileReader()
      fileReader.readAsText(file.raw)
      fileReader.onload = async evt => {
        try {
          let data = markdown.transformMarkdownTo(evt.target.result)
          this.$bus.$emit('setData', data)
          this.$message.success(this.$t('import.importSuccess'))
        } catch (error) {
          console.log(error)
          this.$message.error(this.$t('import.fileParsingFailed'))
        }
      }
    },

    // 导入指定文件
    handleImportFile(file) {
      this.onChange({
        raw: file,
        name: file.name
      })
      if (this.fileList.length <= 0) return
      this.confirm()
    }
  }
}
</script>

<style lang="less" scoped>
.nodeImportDialog {
  /deep/ .el-dialog { max-width: calc(100vw - 32px); }
  /deep/ .el-dialog__body { padding-top: 20px; padding-bottom: 20px; }
  .restoreBackup { margin-top: 20px; }
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
      textarea { border-color: #53606c; }
    }
    h3 { margin: 0 0 8px; font-size: 16px; color: inherit; }
    p { margin: 0 0 12px; }
    ol { margin: 0 0 16px; padding-left: 22px; }
    li + li { margin-top: 6px; }
    .copyStatus { margin-top: 10px; }
    details { margin-top: 14px; }
    summary { cursor: pointer; width: fit-content; }
    summary:focus-visible, textarea:focus-visible { outline: 2px solid #409eff; outline-offset: 3px; }
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
