<template>
  <div
    class="sidebarContainer"
    @click.stop
    :class="{ show: show, isDark: isDark }"
    :style="{ zIndex: zIndex }"
    :inert="show ? null : ''"
    :aria-hidden="show ? 'false' : 'true'"
    @keydown.esc.stop.prevent="close"
  >
    <span
      class="closeBtn el-icon-close"
      role="button"
      :tabindex="show ? 0 : -1"
      aria-label="Close sidebar"
      @click="close"
      @keydown.enter.stop.prevent="close"
      @keydown.space.stop.prevent="close"
    ></span>
    <div class="sidebarHeader" v-if="title">
      {{ title }}
    </div>
    <div class="sidebarContent customScrollbar" ref="sidebarContent">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { store } from '@/config'
import { mapState, mapMutations } from 'vuex'

// 侧边栏容器
export default {
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      show: false,
      zIndex: 0,
      returnFocus: null
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark
    })
  },
  watch: {
    show(val, oldVal) {
      if (val && !oldVal) {
        this.zIndex = store.sidebarZIndex++
        this.returnFocus = document.querySelector('.sidebarTriggerContainer .triggerItem[aria-expanded="true"]') || document.activeElement
      } else if (!val && this.$el.contains(document.activeElement)) {
        // Switching sections leaves focus on the new trigger; closing from
        // inside a panel restores the trigger that opened that panel.
        this.restoreFocus()
      }
    }
  },
  created() {
    this.$bus.$on('closeSideBar', this.handleCloseSidebar)
  },
  beforeDestroy() {
    this.$bus.$off('closeSideBar', this.handleCloseSidebar)
  },
  methods: {
    ...mapMutations(['setActiveSidebar']),

    handleCloseSidebar() {
      this.close()
    },

    close() {
      if (!this.show) return
      this.restoreFocus()
      this.show = false
      this.setActiveSidebar(null)
    },

    restoreFocus() {
      if (this.returnFocus && this.returnFocus.isConnected) this.returnFocus.focus({ preventScroll: true })
    },

    getEl() {
      return this.$refs.sidebarContent
    }
  }
}
</script>

<style lang="less" scoped>
.sidebarContainer {
  position: fixed;
  right: -300px;
  top: 110px;
  bottom: 0;
  width: 300px;
  background-color: #fff;
  border-left: 1px solid rgba(24, 22, 40, 0.08);
  border-top: 1px solid rgba(24, 22, 40, 0.08);
  border-top-left-radius: 16px;
  box-shadow: -12px 0 32px rgba(24, 22, 40, 0.08);
  display: flex;
  flex-direction: column;
  visibility: hidden;
  transition: right 0.3s, visibility 0s 0.3s;

  &.isDark {
    background-color: #1f2229;
    border-left-color: hsla(0, 0%, 100%, 0.08);
    border-top-color: hsla(0, 0%, 100%, 0.08);
    box-shadow: -12px 0 32px rgba(0, 0, 0, 0.32);

    .sidebarHeader {
      border-bottom-color: hsla(0, 0%, 100%, 0.1);
      color: #fff;
    }

    .closeBtn {
      color: #fff;
    }
  }

  &.show {
    right: 0;
    visibility: visible;
    transition: right 0.3s, visibility 0s;
  }

  .closeBtn {
    position: absolute;
    right: 20px;
    top: 12px;
    font-size: 18px;
    padding: 3px;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 140ms ease-out;
    &:hover { background-color: rgba(127, 120, 140, 0.14); }
    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 3px;
    }
  }

  .sidebarHeader {
    width: 100%;
    height: 44px;
    border-bottom: 1px solid rgba(24, 22, 40, 0.08);
    font-size: 15px;
    font-weight: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 0;
    flex-shrink: 0;
  }

  .sidebarContent {
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}
@media (prefers-reduced-motion: reduce) {
  .sidebarContainer .closeBtn { transition: none; }
}
</style>
