import en from './en_us'
import zh from './zh_cn'
import zhtw from './zh_tw'
import vi from './vi_vn'
import document from './document'

export default {
  zh: { ...zh, document: document.zh },
  zhtw: { ...zhtw, document: document.zhtw },
  en: { ...en, document: document.en },
  vi: { ...vi, document: document.vi }
}
