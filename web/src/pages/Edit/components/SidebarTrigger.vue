<template>
  <div
    class="sidebarTriggerContainer "
    @click.stop
    :class="{ hasActive: show && activeSidebar, hasTheme: activeSidebar === 'theme', show: show, isDark: isDark }"
    :style="{ maxHeight: maxHeight + 'px' }"
  >
    <div class="toggleShowBtn" :class="{ hide: !show }" @click="show = !show">
      <span class="iconfont iconjiantouyou"></span>
    </div>
    <div class="trigger customScrollbar">
      <div
        class="triggerItem"
        v-for="item in triggerList"
        :key="item.value"
        role="button"
        :tabindex="show ? 0 : -1"
        :aria-label="item.name"
        :aria-expanded="String(activeSidebar === item.value)"
        :class="{ active: activeSidebar === item.value }"
        @click="trigger(item)"
        @keydown.enter.stop.prevent="trigger(item)"
        @keydown.space.stop.prevent="trigger(item)"
      >
        <div class="triggerIcon iconfont" :class="[item.icon]"></div>
        <div class="triggerName">{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import { sidebarTriggerList } from '@/config'

// 侧边栏触发器
export default {
  data() {
    return {
      show: true,
      maxHeight: 0
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark,
      activeSidebar: state => state.activeSidebar,
      isReadonly: state => state.isReadonly,
      enableAi: state => state.localConfig.enableAi
    }),

    triggerList() {
      let list = sidebarTriggerList[this.$i18n.locale] || sidebarTriggerList.zh
      if (this.isReadonly) {
        list = list.filter(item => {
          return ['outline', 'shortcutKey', 'ai'].includes(item.value)
        })
      }
      if (!this.enableAi) {
        list = list.filter(item => {
          return item.value !== 'ai'
        })
      }
      return list
    }
  },
  watch: {
    isReadonly(val) {
      if (val) {
        this.setActiveSidebar(null)
      }
    }
  },
  created() {
    window.addEventListener('resize', this.onResize)
    this.updateSize()
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
  },
  methods: {
    ...mapMutations(['setActiveSidebar']),

    trigger(item) {
      this.setActiveSidebar(item.value)
    },

    onResize() {
      this.updateSize()
    },

    updateSize() {
      const topMargin = 110
      const bottomMargin = 80
      this.maxHeight = window.innerHeight - topMargin - bottomMargin
    }
  }
}
</script>

<style lang="less" scoped>
.sidebarTriggerContainer {
  position: fixed;
  top: 110px;
  bottom: 80px;
  right: -60px;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  justify-content: center;

  &.isDark {
    .trigger {
      background-color: rgba(31, 34, 41, 0.94);
      border-color: rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);

      .triggerItem {
        color: hsla(0, 0%, 100%, 0.72);

        &:hover {
          background-color: hsla(0, 0%, 100%, 0.08);
          color: #fff;
        }

        &.active {
          color: #f2b8dc;
          background-color: hsla(0, 0%, 100%, 0.08);
          &::before { background: #f2b8dc; }
        }
      }
    }
  }

  &.show {
    right: 0;
  }

  &.hasActive {
    right: 305px;

    &.hasTheme {
      right: calc(var(--art-theme-sidebar-width) + 5px);
    }
  }

  .toggleShowBtn {
    position: absolute;
    left: -6px;
    width: 35px;
    height: 60px;
    background: #8a3f74;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    transition: left 0.1s linear;
    z-index: 0;
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
    display: flex;
    align-items: center;
    padding-left: 4px;

    &.hide {
      left: -8px;

      span {
        transform: rotateZ(180deg);
      }
    }

    &:hover {
      left: -18px;
    }

    span {
      color: #fff;
      transition: all 0.1s;
    }
  }

  .trigger {
    position: relative;
    width: 60px;
    background-color: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(24, 22, 40, 0.07);
    box-shadow: 0 1px 2px rgba(24, 22, 40, 0.04), 0 8px 24px rgba(24, 22, 40, 0.07);
    backdrop-filter: blur(10px);
    border-radius: 14px;
    padding: 4px 0;
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;

    .triggerItem {
      &:focus-visible {
        outline: 2px solid currentColor;
        outline-offset: -3px;
      }
      height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      position: relative;
      cursor: pointer;
      color: #4a4552;
      user-select: none;
      white-space: nowrap;
      margin: 0 4px;
      border-radius: 10px;
      transition: background-color 140ms ease-out, color 140ms ease-out;

      &:hover {
        background-color: #f3eef4;
        color: #2b2233;
      }

      &.active {
        color: #8a3f74;
        font-weight: 600;
        background-color: #f3eef4;
        &::before {
          content: '';
          position: absolute;
          left: -4px;
          top: 16px;
          bottom: 16px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: #8a3f74;
        }
      }

      .triggerIcon {
        font-size: 18px;
        margin-bottom: 5px;
      }

      .triggerName {
        font-size: 12px;
      }
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  .sidebarTriggerContainer .trigger .triggerItem { transition: none; }
}
</style>
