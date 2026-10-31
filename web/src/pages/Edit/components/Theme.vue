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
        {{ isChinese ? `${artCount} 种画风，同一份灵感。` : `${artCount} visual worlds for your ideas.` }}
      </p>
      <div v-if="isArtGroup" class="themeFilters">
        <input v-model="search" class="themeSearch" type="search" :placeholder="isChinese ? '搜索画风、名称或关键词' : 'Search names or styles'" :aria-label="isChinese ? '搜索画风' : 'Search themes'" @keydown.stop @keydown.esc.stop.prevent="$refs.sidebar.close()" />
        <div class="themeCategories" :aria-label="isChinese ? '画风家族' : 'Style families'">
          <button v-for="category in categories" :key="category.value" type="button" :aria-pressed="artCategory === category.value ? 'true' : 'false'" @click="artCategory = category.value">{{ isChinese ? category.zh : category.name }}</button>
        </div>
        <div class="themeTones" :aria-label="isChinese ? '明暗' : 'Appearance'">
          <button v-for="tone in tones" :key="tone.value" type="button" :aria-pressed="artTone === tone.value ? 'true' : 'false'" @click="artTone = tone.value">{{ isChinese ? tone.zh : tone.name }}</button>
          <span class="themeResultCount" aria-live="polite">{{ isChinese ? `${currentList.length} 款` : `${currentList.length} styles` }}</span>
        </div>
      </div>
      <div v-if="isArtGroup && !currentList.length" class="themeEmpty">
        <p>{{ isChinese ? '没有匹配的画风。试试其他关键词。' : 'No matching styles. Try another search.' }}</p>
        <button type="button" @click="clearFilters">{{ isChinese ? '清除筛选' : 'Clear filters' }}</button>
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
            <img v-if="activeSidebar === 'theme'" :src="item.img || themeImgMap[item.value]" :width="item.slug ? 480 : null" :height="item.slug ? 280 : null" alt="" loading="lazy" />
            <span v-if="item.value === theme" class="selectedMark" aria-hidden="true">
              <svg width="13" height="13" viewBox="0 0 16 16"><path d="M3 8l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </span>
          </span>
          <span class="themeCaption">
            <span class="name">{{ isChinese && item.zh ? item.zh : item.name }}</span>
            <span v-if="item.slug" class="themeSwatches" aria-hidden="true">
              <i v-for="(color, index) in [item.rootFill, item.accent, item.background]" :key="index" :style="{ backgroundColor: color }"></i>
            </span>
          </span>
          <span v-if="item.zh" class="themeChineseName">{{ isChinese ? item.name : item.zh }}</span>
          <span v-if="item.description" class="themeDescription">{{ isChinese ? item.descriptionZh : item.description }}</span>
        </button>
      </div>
      <p class="themeStatus" aria-live="polite" role="status">
        {{ statusText }}
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
import { artThemes, prepareArtTheme, hasArtFontFallback } from '@/mappop/themes'

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
      search: '',
      artTone: 'all',
      artCount: artThemes.length,
      fontFallback: false,
      themeRevision: 0,
      applyRequest: 0,
      tones: [
        { value: 'all', name: 'Any light', zh: '全部明暗' },
        { value: 'light', name: 'Light', zh: '浅色' },
        { value: 'dark', name: 'After dark', zh: '夜色' }
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

    categories() {
      const families = [
        { value: 'play', name: 'Playful', zh: '趣味' },
        { value: 'paper', name: 'Paper & ink', zh: '纸与墨' },
        { value: 'graphic', name: 'Graphic', zh: '设计' },
        { value: 'technical', name: 'Technical', zh: '技术' },
        { value: 'material', name: 'Materials', zh: '材质' }
      ]
      return [{ value: 'all', name: `All ${artThemes.length}`, zh: `全部 ${artThemes.length}` }, ...families.filter(family => artThemes.some(theme => theme.category === family.value))]
    },

    statusText() {
      if (this.applyingTheme) return this.isChinese ? '正在准备画风…' : 'Preparing your theme…'
      if (this.fontFallback) return this.isChinese ? '部分字体加载失败，正在使用回退字体。可继续编辑；请重载后导出图片。' : 'A font failed; fallback type is in use. Keep editing, or reload before image export.'
      return this.isChinese ? '预览来自真实导图。内容与布局保持不变。' : 'Real map previews. Your content and layout stay in place.'
    },

    currentList() {
      const group = this.groupList.find(item => item.name === this.activeName)
      const list = group ? group.list : []
      if (!this.isArtGroup) return list
      const words = this.search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
      return list.filter(item => {
        const text = [item.name, item.zh, item.description, item.descriptionZh, item.keywords || '', item.slug].join(' ').toLocaleLowerCase()
        return (this.artCategory === 'all' || item.category === this.artCategory) &&
          (this.artTone === 'all' || item.dark === (this.artTone === 'dark')) &&
          words.every(word => text.includes(word))
      })
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
    this.mindMap.on('mappop_art_status', this.handleFontStatus)
    this.fontFallback = hasArtFontFallback(this.theme)
  },
  beforeDestroy() {
    this.applyRequest++
    this.mindMap.off('view_theme_change', this.handleViewThemeChange)
    this.mindMap.off('mappop_art_status', this.handleFontStatus)
  },
  methods: {
    ...mapMutations(['setLocalConfig']),

    clearFilters() {
      this.search = ''
      this.artCategory = 'all'
      this.artTone = 'all'
    },

    handleFontStatus(status) {
      if (status.theme === this.mindMap.getTheme()) this.fontFallback = status.fallback
    },

    handleViewThemeChange() {
      this.themeRevision++
      this.theme = this.mindMap.getTheme()
      this.fontFallback = hasArtFontFallback(this.theme)
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
      return item.zh && this.isChinese ? `${item.zh} · ${item.name}` : item.name
    },

    async changeTheme(theme, config) {
      const request = ++this.applyRequest
      const revision = this.themeRevision
      this.applyingTheme = theme.value
      try {
        await prepareArtTheme(theme.value)
        if (this._isDestroyed || request !== this.applyRequest || revision !== this.themeRevision) return
        this.$bus.$emit('showLoading')
        this.mindMap.setTheme(theme.value)
        this.theme = theme.value
        this.handleDark()
        storeData({ theme: { template: theme.value, config } })
      } finally {
        if (request === this.applyRequest) this.applyingTheme = ''
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
  width: var(--art-theme-sidebar-width);
  right: -420px;
  &.show { right: 0; }
  /deep/ .sidebarContent {
    flex: 1;
    min-height: 0;
    height: auto;
  }
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
    /deep/ .el-tabs__item { font-size: 12px; padding: 0 12px; color: #6c6675; &:hover { color: #2b2233; } &.is-active { color: #8a3f74; font-weight: 600; } }
    /deep/ .el-tabs__active-bar { background-color: #8a3f74; height: 2px; border-radius: 2px; }
    /deep/ .el-tabs__nav-wrap::after { height: 1px; background-color: #ece8ef; }
  }
  .themeIntroduction {
    font-size: 12px;
    line-height: 1.6;
    margin: 0;
    padding: 4px 18px 10px;
    color: #6c6675;
  }
  .themeListTheme {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 4px 14px 18px;
    &.artGrid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      grid-auto-rows: max-content;
      align-content: start;
      gap: 12px;
      .themeItem { margin: 0; }
      .themeCaption { gap: 6px; }
      .name { font-size: 12px; }
      .themeCaption { padding: 8px 4px 0; }
      .themeDescription { padding: 4px 4px 0; }
    }
  }
  .themeFilters { flex-shrink: 0; padding: 0 14px 10px; }
  .themeSearch {
    width: 100%; min-width: 0; box-sizing: border-box;
    border: 1px solid #d8d3dd; border-radius: 10px;
    padding: 9px 10px 9px 32px; font: inherit; font-size: 12px;
    color: inherit; caret-color: currentColor;
    background: #f7f5f8 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 16 16' fill='none' stroke='%23746d7c' stroke-width='1.8' stroke-linecap='round'%3E%3Ccircle cx='7' cy='7' r='4.8'/%3E%3Cpath d='M10.6 10.6L14 14'/%3E%3C/svg%3E") no-repeat 11px 50%;
    transition: border-color 140ms ease-out, background-color 140ms ease-out;
    &::placeholder { color: #6c6675; opacity: 1; }
    &:hover { border-color: #b9b1c0; }
    &:focus { background-color: #fff; border-color: #8a3f74; }
    &:focus-visible { outline: 3px solid rgba(138, 63, 116, 0.22); outline-offset: 0; }
  }
  .themeTones { display: flex; align-items: center; gap: 4px; padding-top: 6px; }
  .themeResultCount { margin-left: auto; font-size: 11px; white-space: nowrap; color: #6c6675; font-variant-numeric: tabular-nums; }
  .themeEmpty { padding: 6px 18px 12px; font-size: 12px; line-height: 1.6; }
  .themeEmpty button { font: inherit; cursor: pointer; color: inherit; background: none; border: 0; text-decoration: underline; text-underline-offset: 3px; }
  .themeTones button, .themeCategories button {
    font: inherit; font-size: 11px; line-height: 1.3; padding: 6px 10px; color: inherit;
    border: 1px solid transparent; border-radius: 999px; background: #f3f1f4; cursor: pointer;
    transition: background-color 140ms ease-out, color 140ms ease-out;
    &:hover { background: #ebe5ee; }
    &[aria-pressed=true] { background: #2b2233; border-color: #2b2233; color: #fff; font-weight: 600; }
    &:focus-visible { outline: 2px solid #8a3f74; outline-offset: 2px; }
  }
  .themeCategories {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 7px 0 0;
    button { padding: 6px 10px; }
  }
  .themeChineseName { display: block; padding: 2px 4px 0; font-size: 12px; line-height: 1.5; }
  .themeItem {
    display: block;
    appearance: none;
    width: 100%;
    cursor: pointer;
    margin: 0 0 14px;
    padding: 5px 5px 11px;
    border: 1px solid #e6e1ea;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(24, 22, 40, 0.04);
    color: inherit;
    font: inherit;
    text-align: left;
    overflow: hidden;
    scroll-margin-block: 6px;
    transition: border-color 160ms ease-out, box-shadow 200ms ease-out, transform 200ms ease-out;
    &:hover { border-color: #cfc6d6; box-shadow: 0 10px 24px rgba(24, 22, 40, 0.1); transform: translateY(-2px); }
    &:focus-visible { outline: 3px solid #8a3f74; outline-offset: 2px; }
    &:disabled { cursor: wait; opacity: 0.7; }
    &.active { border-color: #8a3f74; box-shadow: 0 0 0 2px #8a3f74, 0 10px 24px rgba(138, 63, 116, 0.16); background: #fbf7fa; }
    .imgBox {
      display: block;
      position: relative;
      width: 100%;
      overflow: hidden;
      border-radius: 10px;
      box-shadow: inset 0 0 0 1px rgba(24, 22, 40, 0.06);
      img { display: block; width: 100%; height: auto; }
    }
    .themeCaption {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 7px 0;
    }
    .name { font-size: 14px; font-weight: 700; line-height: 1.4; color: #2b2233; }
    .themeDescription {
      display: block;
      padding: 4px 7px 0;
      font-size: 11px;
      line-height: 1.5;
      color: #6c6675;
    }
    .themeSwatches {
      display: flex;
      gap: 3px;
      flex-shrink: 0;
      i { display: block; width: 10px; height: 10px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(24, 22, 40, 0.16); }
    }
    .selectedMark {
      position: absolute;
      right: 7px;
      bottom: 7px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #8a3f74;
      color: white;
      box-shadow: 0 0 0 2px #fff, 0 4px 10px rgba(24, 22, 40, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .themeStatus {
    flex-shrink: 0;
    margin: 0;
    padding: 10px 15px;
    border-top: 1px solid #ece8ef;
    font-size: 11px;
    line-height: 1.5;
    color: #6c6675;
  }
  &.isDark {
    color: #ece8f0;
    .tabBox {
      /deep/ .el-tabs__item { color: #b9b2c2; &:hover { color: #fff; } &.is-active { color: #f2b8dc; } }
      /deep/ .el-tabs__active-bar { background-color: #f2b8dc; }
      /deep/ .el-tabs__nav-wrap::after { background-color: rgba(255, 255, 255, 0.08); }
    }
    .themeIntroduction, .themeStatus, .themeDescription, .themeResultCount { color: #b9b2c2; }
    .themeItem .name { color: #fff; }
    .themeStatus { border-color: rgba(255, 255, 255, 0.08); }
    .themeSearch {
      border-color: rgba(255, 255, 255, 0.14); background-color: rgba(255, 255, 255, 0.05);
      &::placeholder { color: #b9b2c2; }
      &:focus { background-color: rgba(255, 255, 255, 0.08); border-color: #f2b8dc; }
      &:focus-visible { outline-color: rgba(242, 184, 220, 0.3); }
    }
    .themeTones button, .themeCategories button {
      background: rgba(255, 255, 255, 0.06);
      &:hover { background: rgba(255, 255, 255, 0.12); }
      &[aria-pressed=true] { background: #f2b8dc; border-color: #f2b8dc; color: #24172a; }
      &:focus-visible { outline-color: #f2b8dc; }
    }
    .themeItem {
      background: #282c34;
      border-color: rgba(255, 255, 255, 0.08);
      &:hover { background: #2e333c; border-color: rgba(255, 255, 255, 0.18); box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35); }
      &.active { border-color: #f2b8dc; box-shadow: 0 0 0 2px #f2b8dc; background: #33303a; }
      &:focus-visible { outline-color: #f2b8dc; }
      .selectedMark { background: #f2b8dc; color: #24172a; box-shadow: 0 0 0 2px #282c34; }
    }
  }
}
// Below this height the filters leave too little room for a complete card.
// Let the sidebar body own scrolling; its header and close button stay fixed.
@media (max-height: 640px) {
  .themeGroupList {
    height: auto;
    min-height: 100%;
    overflow: visible;
    .themeListTheme {
      flex: none;
      overflow: visible;
    }
  }
}
@media (prefers-reduced-motion: reduce) {
  .themeGroupList .themeItem { transition: none; &:hover { transform: none; } }
  .themeGroupList .themeSearch, .themeGroupList .themeTones button, .themeGroupList .themeCategories button { transition: none; }
  .artThemeSidebar { transition: none; }
}
</style>
