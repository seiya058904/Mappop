// Art direction is expressed per hierarchy level, never stored on document nodes.
// Geometry lives in decorations.js; all metrics still use upstream defineTheme().
export const definitions = [
  {
    slug: 'pixel-arcade', name: 'Pixel Arcade', zh: '像素街机', category: 'play',
    description: 'Pixel type · stepped circuits', descriptionZh: '中文像素 · 阶梯电路',
    font: 'pixel', dark: true, background: '#17223a', ink: '#d3f4f3',
    rootFill: '#ffe178', rootInk: '#202943', secondFill: '#30435c', nodeFill: '#172b43',
    border: '#82caba', accent: '#ffab9a', line: '#82caba',
    radius: 0, borderWidth: 2, lineWidth: 2, lineStyle: 'straight',
    rootSize: 36, secondSize: 24, nodeSize: 24, spacing: [48, 16], padding: [18, 10],
    shadow: ['#070e21', 4, 4, 0], levels: { root: { paddingX: 32, paddingY: 22 }, node: { borderWidth: 1 } }
  },
  {
    slug: 'anime-pop', name: 'Anime Pop', zh: '樱色漫画', category: 'play',
    description: 'Manga panels · sakura margins', descriptionZh: '樱色分镜 · 轻盈手写',
    font: 'hand', dark: false, background: '#fff8f5', ink: '#553b51',
    rootFill: '#f9d4df', rootInk: '#512b43', secondFill: '#fff0c9', nodeFill: '#fffdfc',
    border: '#b87d98', accent: '#ac466c', line: '#b87d98',
    radius: 22, borderWidth: 1.3, lineWidth: 1.5, lineStyle: 'curve',
    rootSize: 30, secondSize: 23, nodeSize: 19, spacing: [54, 16], padding: [18, 9],
    shadow: ['#bd7f9a', 3, 4, 0], levels: { second: { borderRadius: 3 }, node: { borderColor: '#d4b6c4', borderWidth: 1 } }
  },
  {
    slug: 'toon-motion', name: 'Toon Motion', zh: '卡通动感', category: 'play',
    description: 'Balloon ink · playful Chinese type', descriptionZh: '中文漫画字 · 对话气泡',
    font: 'comic', dark: false, background: '#fff1c5', ink: '#302b35',
    rootFill: '#ff916f', rootInk: '#302531', secondFill: '#ffe190', nodeFill: '#fffdf5',
    border: '#34303c', accent: '#416a97', line: '#34303c',
    radius: 18, borderWidth: 2.5, lineWidth: 2.5, lineStyle: 'direct',
    rootSize: 31, secondSize: 24, nodeSize: 20, spacing: [56, 20], padding: [22, 11],
    shadow: ['#34303c', 3, 4, 0], levels: { node: { borderWidth: 1.8 } }
  },
  {
    slug: 'zen-japan', name: 'Zen Japan', zh: '日式留白', category: 'paper',
    description: 'Washi · open space · vermilion', descriptionZh: '细线留白 · 宋体朱印',
    font: 'serif', dark: false, background: '#f7f3e9', ink: '#3c4038',
    rootFill: '#f7f3e9', rootInk: '#343c32', secondFill: 'transparent', nodeFill: 'transparent',
    border: '#a4aa94', accent: '#a63e30', line: '#909a83',
    radius: 0, borderWidth: 0, lineWidth: 1, lineStyle: 'straight',
    rootSize: 30, secondSize: 22, nodeSize: 18, spacing: [76, 24], padding: [16, 9],
    shadow: ['#6b715e', 0, 0, 0], levels: { root: { borderWidth: 1, paddingX: 34, paddingY: 22 }, second: { fontWeight: 600 } }
  },
  {
    slug: 'ink-wash', name: 'Ink Wash', zh: '水墨山岚', category: 'paper',
    description: 'Brush lettering · flowing ink', descriptionZh: '中文毛笔 · 干湿墨迹',
    font: 'brush', dark: false, background: '#f5f4ef', ink: '#353b3c',
    rootFill: '#30393b', rootInk: '#fffdf6', secondFill: '#e0e5e0', nodeFill: 'transparent',
    border: '#65716d', accent: '#a84031', line: '#667671',
    radius: 0, borderWidth: 0, lineWidth: 2, lineStyle: 'curve',
    rootSize: 34, secondSize: 26, nodeSize: 22, spacing: [66, 18], padding: [18, 9],
    shadow: ['#6e7a74', 0, 2, 2], levels: { root: { paddingX: 36, paddingY: 22 } }
  },
  {
    slug: 'sketchbook', name: 'Sketchbook', zh: '手绘速写', category: 'paper',
    description: 'Chinese handwriting · pencil rules', descriptionZh: '中文手写 · 铅笔复线',
    font: 'hand', dark: false, background: '#faf8f1', ink: '#3a4a5b',
    rootFill: '#faf8f1', rootInk: '#344458', secondFill: '#f4f2e9', nodeFill: 'transparent',
    border: '#667789', accent: '#b24f41', line: '#718297',
    radius: 0, borderWidth: 1.2, lineWidth: 1.3, lineStyle: 'curve',
    rootSize: 32, secondSize: 24, nodeSize: 21, spacing: [52, 18], padding: [16, 9],
    shadow: ['#9c9481', 1, 2, 0], levels: { node: { borderWidth: 0 } }
  },
  {
    slug: 'marker-notes', name: 'Marker Notes', zh: '马克便签', category: 'play',
    description: 'Taped paper · highlighter swashes', descriptionZh: '胶带纸张 · 荧光笔势',
    font: 'comic', dark: false, background: '#f0ece2', ink: '#3d4133',
    rootFill: '#e4ef90', rootInk: '#303b27', secondFill: '#f8c7b5', nodeFill: '#fff0a4',
    border: '#a39b78', accent: '#54745b', line: '#73816b',
    radius: 0, borderWidth: 0, lineWidth: 3, lineStyle: 'direct',
    rootSize: 29, secondSize: 22, nodeSize: 19, spacing: [48, 18], padding: [18, 10],
    shadow: ['#80775e', 2, 4, 1.5], levels: { root: { paddingY: 24 }, node: { paddingY: 8 } }
  },
  {
    slug: 'cyber-neon', name: 'Cyber Neon', zh: '赛博霓虹', category: 'night',
    description: 'Cut terminals · precise light', descriptionZh: '切角终端 · 局部辉光',
    font: 'tech', dark: true, background: '#101c24', ink: '#ccece9',
    rootFill: '#1b4147', rootInk: '#e7fff9', secondFill: '#16333d', nodeFill: '#112730',
    border: '#51c5bd', accent: '#f2bb79', line: '#4c9e9c',
    radius: 0, borderWidth: 1, lineWidth: 1.3, lineStyle: 'straight',
    rootSize: 32, secondSize: 24, nodeSize: 18, spacing: [64, 16], padding: [22, 11],
    shadow: ['#4ac9c0', 0, 0, 2], levels: { root: { paddingX: 34, paddingY: 22 }, node: { borderWidth: 0.7 } }
  },
  {
    slug: 'watercolor-garden', name: 'Watercolor Garden', zh: '水彩花园', category: 'paper',
    description: 'Pigment edges · botanical washes', descriptionZh: '植物色晕 · 水彩纸边',
    font: 'hand', dark: false, background: '#f4f5ec', ink: '#334f44',
    rootFill: '#b5d4b7', rootInk: '#254735', secondFill: '#e8c9bc', nodeFill: '#e4ebd6',
    border: '#86ab8e', accent: '#a4544b', line: '#7d9f86',
    radius: 12, borderWidth: 0, lineWidth: 1.7, lineStyle: 'curve',
    rootSize: 32, secondSize: 23, nodeSize: 20, spacing: [60, 20], padding: [23, 12],
    shadow: ['#9fb29c', 1, 3, 2], levels: { root: { paddingX: 36, paddingY: 22 } }
  },
  {
    slug: 'paper-cut', name: 'Paper Cut', zh: '纸艺拼贴', category: 'paper',
    description: 'Layered cuts · folded labels', descriptionZh: '叠纸投影 · 裁切标签',
    font: 'sans', dark: false, background: '#e9e0d1', ink: '#2e4347',
    rootFill: '#33636b', rootInk: '#fff8e9', secondFill: '#e8a28a', nodeFill: '#fff5e2',
    border: '#936a55', accent: '#bf634d', line: '#a47761',
    radius: 0, borderWidth: 0, lineWidth: 2, lineStyle: 'direct',
    rootSize: 27, secondSize: 21, nodeSize: 17, spacing: [62, 22], padding: [24, 13],
    shadow: ['#79644f', 4, 5, 1.4], levels: { root: { paddingX: 36, paddingY: 23 }, second: { fontWeight: 600 } }
  },
  {
    slug: 'ukiyo-e-print', name: 'Ukiyo-e Print', zh: '浮世木版', category: 'paper',
    description: 'Indigo blocks · vermilion printing', descriptionZh: '靛蓝木版 · 朱红套印',
    font: 'serif', dark: false, background: '#efe5c9', ink: '#233f52',
    rootFill: '#25495b', rootInk: '#fff5d7', secondFill: '#a43f30', nodeFill: '#f9efcf',
    border: '#456377', accent: '#a43f30', line: '#446173',
    radius: 0, borderWidth: 1.2, lineWidth: 2, lineStyle: 'straight',
    rootSize: 30, secondSize: 22, nodeSize: 18, spacing: [60, 19], padding: [22, 11],
    shadow: ['#886b47', 2, 3, 0], levels: { root: { paddingX: 34, paddingY: 24 }, second: { color: '#fff7e1', borderColor: '#913628' }, node: { borderWidth: 0.8 } }
  },
  {
    slug: 'blueprint-lab', name: 'Blueprint Lab', zh: '工程蓝图', category: 'night',
    description: 'Dimension marks · drafting grid', descriptionZh: '尺寸标注 · 精密制图',
    font: 'tech', dark: true, background: '#183f62', ink: '#dfedf6',
    rootFill: '#204c70', rootInk: '#f1f7ff', secondFill: '#183f62', nodeFill: '#183f62',
    border: '#b3ccdf', accent: '#efd39b', line: '#a6c4d9',
    radius: 0, borderWidth: 1, lineWidth: 1, lineStyle: 'straight',
    rootSize: 29, secondSize: 22, nodeSize: 17, spacing: [68, 20], padding: [21, 11],
    shadow: ['#132e47', 0, 0, 0], levels: { root: { paddingX: 34, paddingY: 23 }, node: { borderDasharray: '3,3', borderWidth: 0.7 } }
  },
  {
    slug: 'bauhaus-geometry', name: 'Bauhaus Geometry', zh: '包豪斯几何', category: 'graphic',
    description: 'Primary forms · deliberate order', descriptionZh: '原色几何 · 非对称秩序',
    font: 'sans', dark: false, background: '#f3efe4', ink: '#24282a',
    rootFill: '#252b2c', rootInk: '#fff8e9', secondFill: '#efc64c', nodeFill: 'transparent',
    border: '#24282a', accent: '#bd3f30', line: '#364c63',
    radius: 0, borderWidth: 0, lineWidth: 2.5, lineStyle: 'direct',
    rootSize: 29, secondSize: 21, nodeSize: 18, spacing: [60, 18], padding: [24, 11],
    shadow: ['#252b2c', 0, 0, 0], levels: { root: { fontWeight: 700, paddingX: 38, paddingY: 26 }, second: { fontWeight: 700 }, node: { paddingX: 15 } }
  },
  {
    slug: 'glass-aurora', name: 'Glass Aurora', zh: '极光玻璃', category: 'graphic',
    description: 'Opal glass · quiet spectral light', descriptionZh: '透亮玻璃 · 冷暖微光',
    font: 'sans', dark: false, background: '#e4edf3', ink: '#36465a',
    rootFill: '#f4f5ff', rootInk: '#344463', secondFill: '#edf4fc', nodeFill: '#f1f6fa',
    border: '#a4b9d0', accent: '#796697', line: '#99a9c4',
    radius: 13, borderWidth: 0.9, lineWidth: 1.3, lineStyle: 'curve',
    rootSize: 28, secondSize: 21, nodeSize: 17, spacing: [60, 20], padding: [22, 12],
    shadow: ['#7a94aa', 1, 5, 3], levels: { root: { paddingX: 36, paddingY: 24 }, node: { borderColor: '#b6c5d3', borderRadius: 8 } }
  },
  {
    slug: 'vintage-editorial', name: 'Vintage Editorial', zh: '复古书刊', category: 'graphic',
    description: 'Serif hierarchy · letterpress rules', descriptionZh: '宋体活版 · 书刊细线',
    font: 'serif', dark: false, background: '#f3ead8', ink: '#493c30',
    rootFill: '#493c30', rootInk: '#fff4db', secondFill: '#e5dac3', nodeFill: 'transparent',
    border: '#8e7a5e', accent: '#90452d', line: '#9b8769',
    radius: 0, borderWidth: 0, lineWidth: 1, lineStyle: 'straight',
    rootSize: 32, secondSize: 22, nodeSize: 18, spacing: [72, 17], padding: [18, 10],
    shadow: ['#8e7a5e', 0, 0, 0], levels: { root: { paddingX: 24, paddingY: 25, fontWeight: 700 }, second: { fontWeight: 600 }, node: { paddingY: 8 } }
  },
  {
    slug: 'celestial-atlas', name: 'Celestial Atlas', zh: '星象图鉴', category: 'night',
    description: 'Orbital arcs · gold and starlight', descriptionZh: '轨道弧线 · 金银星图',
    font: 'serif', dark: true, background: '#1b263d', ink: '#e4dfcf',
    rootFill: '#24334d', rootInk: '#f8e4b2', secondFill: '#24334d', nodeFill: 'transparent',
    border: '#bba477', accent: '#dfbd79', line: '#8d9bb1',
    radius: 28, borderWidth: 0.9, lineWidth: 1, lineStyle: 'curve',
    rootSize: 29, secondSize: 22, nodeSize: 18, spacing: [72, 22], padding: [24, 11],
    shadow: ['#111a2c', 0, 0, 0], levels: { root: { shape: 'ellipse', paddingX: 36, paddingY: 24 }, node: { borderWidth: 0, paddingX: 14 } }
  }
]
