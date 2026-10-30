<template>
  <Sidebar ref="sidebar" :title="$t('theme.title')" class="artThemeSidebar">
    <div class="themeGroupList" :class="{ isDark: isDark }">
      <el-tabs v-model="activeName" class="tabBox">
        <el-tab-pane
          v-for="group in groupList"
          :key="group.name"
          :label="group.name"
          :name="group.name"
        ></el-tab-pane>
      </el-tabs>
      <p v-if="isArtGroup" class="themeIntroduction">
        {{ isChinese ? '16 种画风，同一份灵感。预览来自真实导图。' : '16 visual worlds. Previews from the real editor.' }}
      </p>
      <div v-if="isArtGroup" class="themeCategories" :aria-label="isChinese ? '主题分类' : 'Theme categories'">
        <button v-for="category in categories" :key="category.value" type="button" :aria-pressed="artCategory === category.value ? 'true' : 'false'" @click="artCategory = category.value">{{ isChinese ? category.zh : category.name }}</button>
      </div>
      <div class="themeListTheme customScrollbar" :class="{ artGrid: isArtGroup }" :aria-busy="applyingTheme ? 'true' : 'false'">
        <button
          type="button"
          class="themeItem"
          v-for="item in currentList"
          :key="item.value"
          @click="useTheme(item)"
          :disabled="!!applyingTheme"
          :aria-pressed="item.value === theme ? 'true' : 'false'"
          :aria-label="themeLabel(item)"
          :class="{ active: item.value === theme, artThemeItem: !!item.slug }"
        >
          <span class="imgBox">
            <img :src="item.img || themeImgMap[item.value]" alt="" loading="lazy" />
            <span v-if="item.value === theme" class="selectedMark" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </span>
          <span class="themeCaption">
            <span class="name">{{ item.name }}</span>
            <span v-if="item.slug" class="themeSwatches" aria-hidden="true">
              <i v-for="color in [item.rootFill, item.accent, item.background]" :key="color" :style="{ backgroundColor: color }"></i>
            </span>
          </span>
          <span v-if="item.zh" class="themeChineseName">{{ item.zh }}</span>
          <span v-if="item.description" class="themeDescription">{{ isChinese ? item.descriptionZh : item.description }}</span>
        </button>
      </div>
      <p class="themeStatus" aria-live="polite" role="status">
        {{ applyingTheme ? (isChinese ? '正在准备画风…' : 'Preparing your theme…') : (isChinese ? '只改变画风，保留内容与布局。' : 'Your content and layout stay in place.') }}
      </p>
    </div>
  </Sidebar>
</template>

<script>
import Sidebar from './Sidebar.vue'
import { storeData } from '@/api'
import { mapState, mapMutations } from 'vuex'
import themeImgMap from 'simple-mind-map-plugin-themes/themeImgMap'
import themeList from 'simple-mind-map-plugin-themes/themeList'
import { artThemes, prepareArtTheme } from '@/mappop/themes'

// 主题
export default {
  components: {
    Sidebar
  },
  props: {
    data: {
      type: [Object, null],
      default: null
    },
    mindMap: {
      type: Object
    }
  },
  data() {
    return {
      themeList: [
        {
          name: '默认主题',
          value: 'default',
          dark: false
        },
        ...themeList
      ].reverse(),
      themeImgMap,
      applyingTheme: '',
      theme: '',
      activeName: '',
      artCategory: 'all',
      categories: [
        { value: 'all', name: 'All 16', zh: '全部 16' },
        { value: 'play', name: 'Playful', zh: '趣味' },
        { value: 'paper', name: 'Paper & ink', zh: '纸与墨' },
        { value: 'graphic', name: 'Graphic', zh: '设计' },
        { value: 'night', name: 'After dark', zh: '夜色' }
      ],
      defaultGroupList: []
    }
  },
  computed: {
    ...mapState({
      isDark: state => state.localConfig.isDark,
      activeSidebar: state => state.activeSidebar,
      extendThemeGroupList: state => state.extendThemeGroupList
    }),

    groupList() {
      return [...this.defaultGroupList, ...this.extendThemeGroupList]
    },

    isChinese() {
      return this.$i18n.locale.indexOf('zh') === 0
    },

    isArtGroup() {
      return this.activeName === 'Mappop Styles'
    },

    currentList() {
      const group = this.groupList.find(item => item.name === this.activeName)
      const list = group ? group.list : []
      return this.isArtGroup && this.artCategory !== 'all' ? list.filter(item => item.category === this.artCategory) : list
    }
  },
  watch: {
    activeSidebar(val) {
      if (val === 'theme') {
        this.theme = this.mindMap.getTheme()
        this.$refs.sidebar.show = true
      } else {
        this.$refs.sidebar.show = false
      }
    }
  },
  created() {
    this.initGroup()
    this.theme = this.mindMap.getTheme()
    this.mindMap.on('view_theme_change', this.handleViewThemeChange)
  },
  beforeDestroy() {
    this.mindMap.off('view_theme_change', this.handleViewThemeChange)
  },
  methods: {
    ...mapMutations(['setLocalConfig']),

    handleViewThemeChange() {
      this.theme = this.mindMap.getTheme()
      this.handleDark()
    },

    initGroup() {
      const baiduThemes = [
        'default',
        'skyGreen',
        'classic2',
        'classic3',
        'classicGreen',
        'classicBlue',
        'blueSky',
        'brainImpairedPink',
        'earthYellow',
        'freshGreen',
        'freshRed',
        'romanticPurple',
        'pinkGrape',
        'mint'
      ]
      const baiduList = []
      const classicsList = []
      this.themeList.forEach(item => {
        if (baiduThemes.includes(item.value)) {
          baiduList.push(item)
        } else if (!item.dark) {
          classicsList.push(item)
        }
      })
      this.defaultGroupList = [
        { name: 'Mappop Styles', list: artThemes },
        {
          name: this.$t('theme.classics'),
          list: classicsList
        },
        {
          name: this.$t('theme.dark'),
          list: this.themeList.filter(item => {
            return item.dark
          })
        },
        {
          name: this.$t('theme.simple'),
          list: baiduList
        }
      ]
      this.activeName = this.defaultGroupList[0].name
    },

    useTheme(theme) {
      if (theme.value === this.theme || this.applyingTheme) return
      const customThemeConfig = this.mindMap.getCustomThemeConfig()
      const hasCustomThemeConfig = Object.keys(customThemeConfig).length > 0
      if (hasCustomThemeConfig) {
        this.$confirm(this.$t('theme.coverTip'), this.$t('theme.tip'), {
          confirmButtonText: this.$t('theme.cover'),
          cancelButtonText: this.$t('theme.reserve'),
          type: 'warning',
          distinguishCancelAndClose: true,
          callback: action => {
            if (action === 'confirm') {
              this.mindMap.setThemeConfig({}, true)
              if (this.data && this.data.theme) this.data.theme.config = {}
              this.changeTheme(theme, {})
            } else if (action === 'cancel') {
              this.changeTheme(theme, customThemeConfig)
            }
          }
        })
      } else {
        this.changeTheme(theme, customThemeConfig)
      }
    },

    themeLabel(item) {
      return item.zh && this.isChinese ? `${item.name} · ${item.zh}` : item.name
    },

    async changeTheme(theme, config) {
      this.applyingTheme = theme.value
      try {
        await prepareArtTheme(theme.value)
        if (this._isDestroyed) return
        this.$bus.$emit('showLoading')
        this.mindMap.setTheme(theme.value)
        this.theme = theme.value
        this.handleDark()
        storeData({ theme: { template: theme.value, config } })
      } finally {
        this.applyingTheme = ''
      }
    },

    handleDark() {
      const extendThemeList = []
      this.extendThemeGroupList.forEach(group => {
        extendThemeList.push(...group.list)
      })
      let target = [...artThemes, ...this.themeList, ...extendThemeList].find(item => {
        return item.value === this.theme
      })
      this.setLocalConfig({
        isDark: target ? !!target.dark : false
      })
    }
  }
}
</script>

<style lang="less" scoped>
.artThemeSidebar {
  width: min(410px, calc(100vw - 12px));
  right: -420px;
  &.show { right: 0; }
}
.themeGroupList {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  color: #34413c;

  .tabBox {
    flex-shrink: 0;
    padding: 0 14px;
    /deep/ .el-tabs__item { font-size: 12px; padding: 0 12px; }
    /deep/ .el-tabs__nav-wrap::after { height: 1px; }
  }
  .themeIntroduction {
    font-size: 12px;
    line-height: 1.6;
    margin: 0;
    padding: 2px 18px 14px;
    color: #68746c;
  }
  .themeListTheme {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 2px 14px 16px;
    &.artGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: max-content;
      align-content: start;
      gap: 12px;
      .themeItem { margin: 0; }
      .name { font-size: 12px; }
      .themeCaption { padding: 8px 4px 0; }
      .themeDescription { padding: 4px 4px 0; }
      .themeSwatches { display: none; }
    }
  }
  .themeCategories {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 0 14px 12px;
    button {
      font: inherit;
      font-size: 11px;
      padding: 6px 8px;
      background: transparent;
      color: inherit;
      border: 1px solid transparent;
      border-radius: 5px;
      cursor: pointer;
      &[aria-pressed=true] { border-color: currentColor; }
      &:focus-visible { outline: 2px solid currentColor; outline-offset: 1px; }
    }
  }
  .themeChineseName { display: block; padding: 2px 4px 0; font-size: 12px; line-height: 1.5; }
  .themeItem {
    display: block;
    appearance: none;
    width: 100%;
    cursor: pointer;
    margin: 0 0 14px;
    padding: 5px 5px 11px;
    border: 1px solid #d9dfd5;
    border-radius: 10px;
    background: #fffefa;
    color: inherit;
    font: inherit;
    text-align: left;
    overflow: hidden;
    transition: border-color 160ms ease-out, background-color 160ms ease-out;
    &:hover { border-color: #7a9889; background: #f4f7ef; }
    &:focus-visible { outline: 3px solid #4d8370; outline-offset: 2px; }
    &:disabled { cursor: wait; opacity: 0.7; }
    &.active { border-color: #396957; background: #eaf1e8; }
    .imgBox {
      display: block;
      position: relative;
      width: 100%;
      overflow: hidden;
      border-radius: 6px;
      img { display: block; width: 100%; height: auto; }
    }
    .themeCaption {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 7px 0;
    }
    .name { font-size: 14px; font-weight: 600; line-height: 1.4; }
    .themeDescription {
      display: block;
      padding: 4px 7px 0;
      font-size: 11px;
      line-height: 1.5;
      color: #667269;
    }
    .themeSwatches {
      display: flex;
      gap: 3px;
      i { display: block; width: 9px; height: 9px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(30, 40, 35, 0.14); }
    }
    .selectedMark {
      position: absolute;
      right: 7px;
      bottom: 7px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #315f4c;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .themeStatus {
    flex-shrink: 0;
    margin: 0;
    padding: 10px 15px;
    border-top: 1px solid #e0e5dc;
    font-size: 11px;
    line-height: 1.5;
    color: #667269;
  }
  &.isDark {
    color: #e6eee9;
    .themeIntroduction, .themeStatus, .themeDescription { color: #b4c6bd; }
    .themeStatus { border-color: #414e48; }
    .themeItem {
      background: #293932;
      border-color: #4c6256;
      &:hover { background: #34483d; border-color: #8da99a; }
      &.active { border-color: #b6d0bd; background: #354d3c; }
      &:focus-visible { outline-color: #c6e6ce; }
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  .themeGroupList .themeItem { transition: none; }
  .artThemeSidebar { transition: none; }
}
</style>
