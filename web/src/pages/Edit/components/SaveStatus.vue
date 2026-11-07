<template>
  <div
    v-if="!external"
    class="saveStatus"
    :class="{ problem: problem, isDark: $store.state.localConfig.isDark }"
    @keydown.stop
    @click.stop
  >
    <span role="status" aria-live="polite">{{ message }}</span>
    <template v-if="problem">
      <button v-if="state.issue !== 'damaged'" type="button" @click="retry">
        {{ $t('document.retry') }}
      </button>
      <button type="button" @click="download(false)">
        {{ $t('document.download') }}
      </button>
      <button v-if="state.hasRawRecovery" type="button" @click="download(true)">
        {{ $t('document.downloadRaw') }}
      </button>
    </template>
  </div>
</template>

<script>
import {
  saveState,
  documentSession,
  currentDocument,
  downloadDocument
} from '@/api/document'

export default {
  data: () => ({ state: saveState, external: !!window.takeOverApp }),
  computed: {
    problem() {
      return ['error', 'conflict'].includes(this.state.status)
    },
    message() {
      if (this.problem) return this.$t(`document.${this.state.issue}`)
      if (this.state.status === 'saved')
        return this.state.mode === 'file'
          ? this.$t('document.savedFile', { name: this.state.fileName })
          : this.$t('document.savedBrowser')
      return this.$t(
        `document.${this.state.status === 'loading' ? 'loading' : 'saving'}`
      )
    }
  },
  methods: {
    download: downloadDocument,
    async retry() {
      documentSession.update(currentDocument())
      await documentSession.flush().catch(() => {})
    }
  }
}
</script>

<style lang="less" scoped>
.saveStatus {
  position: fixed;
  left: 20px;
  bottom: 58px;
  z-index: 900;
  max-width: min(620px, calc(100vw - 40px));
  padding: 8px 12px;
  border-radius: 8px;
  background: #fff;
  color: #514656;
  font-size: 12px;
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  &.problem {
    border: 1px solid #9b6638;
  }
  &.isDark {
    background: #1f2229;
    color: #f1e8f5;
  }
  button {
    border: 1px solid currentColor;
    border-radius: 4px;
    padding: 5px 8px;
    color: inherit;
    background: transparent;
    cursor: pointer;
    font: inherit;
    &:hover {
      text-decoration: underline;
    }
    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
  }
}
@media (max-width: 700px) {
  .saveStatus {
    left: 12px;
    bottom: 76px;
    max-width: calc(100vw - 24px);
  }
  .saveStatus button {
    min-height: 36px;
  }
}
</style>
