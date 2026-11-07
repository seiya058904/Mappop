import exampleData from '@/config/welcome'
import { simpleDeepClone } from 'simple-mind-map/src/utils/index'
import { documentSession } from './document'

const SIMPLE_MIND_MAP_CONFIG = 'SIMPLE_MIND_MAP_CONFIG'
const SIMPLE_MIND_MAP_LANG = 'SIMPLE_MIND_MAP_LANG'
const SIMPLE_MIND_MAP_LOCAL_CONFIG = 'SIMPLE_MIND_MAP_LOCAL_CONFIG'

let mindMapData = null

// A malformed preference must not prevent opening a map or destroy its backup.
const configObject = value => value && typeof value === 'object' && !Array.isArray(value) ? value : null
const readConfig = key => {
  try {
    return configObject(JSON.parse(localStorage.getItem(key)))
  } catch (error) {
    return null
  }
}

export const getWelcomeData = () => {
  const data = simpleDeepClone(exampleData)
  // A short vertical overview keeps the first map readable on a phone.
  // Children stay in the document and can be expanded with the node control.
  if (window.innerWidth <= 700) {
    data.layout = 'verticalTimeline3'
    data.root.children.forEach(node => {
      node.data.expand = false
    })
  }
  return data
}

// 获取缓存的思维导图数据
export const getData = () => {
  // 接管模式
  if (window.takeOverApp) {
    mindMapData = window.takeOverAppMethods.getMindMapData()
    return mindMapData
  }
  return documentSession.snapshot()
}

// 存储思维导图数据
export const storeData = data => {
  if (window.takeOverApp) {
    mindMapData = { ...mindMapData, ...data }
    window.takeOverAppMethods.saveMindMapData(mindMapData)
    return
  }
  documentSession.update(data)
}

// 获取思维导图配置数据
export const getConfig = () => {
  if (window.takeOverApp) {
    return configObject(window.takeOverAppMethods.getMindMapConfig())
  }
  return readConfig(SIMPLE_MIND_MAP_CONFIG)
}

// 存储思维导图配置数据
export const storeConfig = config => {
  try {
    if (window.takeOverApp) {
      window.takeOverAppMethods.saveMindMapConfig(config)
      return
    }
    localStorage.setItem(SIMPLE_MIND_MAP_CONFIG, JSON.stringify(config))
  } catch (error) {
    console.log(error)
  }
}

// 存储语言
export const storeLang = lang => {
  if (window.takeOverApp) {
    window.takeOverAppMethods.saveLanguage(lang)
    return
  }
  try { localStorage.setItem(SIMPLE_MIND_MAP_LANG, lang) } catch (error) { /* Session remains usable without preferences. */ }
}

// 获取存储的语言
export const getLang = () => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.getLanguage() || 'en'
  }
  // Storage may be blocked or full; a missing preference must not stop the app mounting.
  try {
    const lang = localStorage.getItem(SIMPLE_MIND_MAP_LANG)
    if (lang) {
      return lang
    }
    storeLang('en')
  } catch (error) {
    console.log(error)
  }
  return 'en'
}

// 存储本地配置
export const storeLocalConfig = config => {
  if (window.takeOverApp) {
    return window.takeOverAppMethods.saveLocalConfig(config)
  }
  try { localStorage.setItem(SIMPLE_MIND_MAP_LOCAL_CONFIG, JSON.stringify(config)) } catch (error) { /* Preferences are optional. */ }
}

// 获取本地配置
export const getLocalConfig = () => {
  if (window.takeOverApp) {
    return configObject(window.takeOverAppMethods.getLocalConfig())
  }
  return readConfig(SIMPLE_MIND_MAP_LOCAL_CONFIG)
}
