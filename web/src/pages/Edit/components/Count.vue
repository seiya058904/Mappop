<template>
  <div class="countContainer" :class="{ isDark: isDark }">
    <div class="item">
      <span class="name">{{ $t('count.words') }}</span>
      <span class="value">{{ words }}</span>
    </div>
    <div class="item">
      <span class="name">{{ $t('count.nodes') }}</span>
      <span class="value">{{ num }}</span>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

// 字数及节点数量统计
let countEl = document.createElement('div')
export default {
  props: {
    mindMap: {
      type: Object
    }
  },
  data() {
    return {
      textStr: '',
      words: 0,
      num: 0
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark
    })
  },
  created() {
    this.$bus.$on('data_change', this.onDataChange)
    if (this.mindMap) {
      this.onDataChange(this.mindMap.getData())
    }
  },
  beforeDestroy() {
    this.$bus.$off('data_change', this.onDataChange)
  },
  methods: {
    // 监听数据变化
    onDataChange(data) {
      this.textStr = ''
      this.words = 0
      this.num = 0
      this.walk(data)
      countEl.innerHTML = this.textStr
      this.words = countEl.textContent.length
    },

    // 遍历
    walk(data) {
      if (!data) return
      this.num++
      this.textStr += String(data.data.text) || ''
      if (data.children && data.children.length > 0) {
        data.children.forEach(item => {
          this.walk(item)
        })
      }
    }
  }
}
</script>

<style lang="less" scoped>
.countContainer {
  padding: 0 12px;
  position: fixed;
  left: 20px;
  bottom: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(24, 22, 40, 0.07);
  border-radius: 999px;
  box-shadow: 0 4px 14px rgba(24, 22, 40, 0.06);
  backdrop-filter: blur(10px);
  height: 26px;
  line-height: 26px;
  font-size: 12px;
  display: flex;

  &.isDark {
    background: rgba(31, 34, 41, 0.92);
    border-color: rgba(255, 255, 255, 0.08);

    .item {
      color: hsla(0, 0%, 100%, 0.75);
    }
  }

  .item {
    color: #5a5562;
    margin-right: 15px;
    font-variant-numeric: tabular-nums;

    &:last-of-type {
      margin-right: 0;
    }

    .name {
      margin-right: 5px;
    }
  }
}

@media screen and (max-width: 900px) {
  .countContainer {
    display: none;
  }
}
</style>
