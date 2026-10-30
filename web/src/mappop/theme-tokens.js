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
    border: '#b87d98', accent: '#ac466c', line: '#a56986',
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
    border: '#a4aa94', accent: '#a63e30', line: '#707e64',
    radius: 0, borderWidth: 0, lineWidth: 1.25, lineStyle: 'straight',
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
    slug: 'cyber-neon', name: 'Cyber Neon', zh: '赛博霓虹', category: 'technical',
    description: 'Cut terminals · precise light', descriptionZh: '切角终端 · 局部辉光',
    font: 'tech', dark: true, background: '#101c24', ink: '#ccece9',
    rootFill: '#1b4147', rootInk: '#e7fff9', secondFill: '#16333d', nodeFill: '#112730',
    border: '#51c5bd', accent: '#f2bb79', line: '#4c9e9c',
    radius: 0, borderWidth: 1, lineWidth: 1.3, lineStyle: 'straight',
    rootSize: 32, secondSize: 24, nodeSize: 18, spacing: [64, 16], padding: [22, 11],
    shadow: ['#4ac9c0', 0, 0, 2], levels: { root: { paddingX: 34, paddingY: 22 }, node: { borderWidth: 0.7 } }
  },
  {
    slug: 'watercolor-garden', name: 'Watercolor Garden', zh: '水彩花园', category: 'material',
    description: 'Pigment edges · botanical washes', descriptionZh: '植物色晕 · 水彩纸边',
    font: 'hand', dark: false, background: '#f4f5ec', ink: '#334f44',
    rootFill: '#b5d4b7', rootInk: '#254735', secondFill: '#e8c9bc', nodeFill: '#e4ebd6',
    border: '#86ab8e', accent: '#a4544b', line: '#607f68',
    radius: 12, borderWidth: 0, lineWidth: 1.7, lineStyle: 'curve',
    rootSize: 32, secondSize: 23, nodeSize: 20, spacing: [60, 20], padding: [23, 12],
    shadow: ['#9fb29c', 1, 3, 2], levels: { root: { paddingX: 36, paddingY: 22 } }
  },
  {
    slug: 'paper-cut', name: 'Paper Cut', zh: '纸艺拼贴', category: 'material',
    description: 'Layered cuts · folded labels', descriptionZh: '叠纸投影 · 裁切标签',
    font: 'sans', dark: false, background: '#e9e0d1', ink: '#2e4347',
    rootFill: '#33636b', rootInk: '#fff8e9', secondFill: '#e8a28a', nodeFill: '#fff5e2',
    border: '#936a55', accent: '#bf634d', line: '#875e49',
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
    slug: 'blueprint-lab', name: 'Blueprint Lab', zh: '工程蓝图', category: 'technical',
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
    slug: 'glass-aurora', name: 'Glass Aurora', zh: '极光玻璃', category: 'material',
    description: 'Opal glass · quiet spectral light', descriptionZh: '透亮玻璃 · 冷暖微光',
    font: 'sans', dark: false, background: '#e4edf3', ink: '#36465a',
    rootFill: '#f4f5ff', rootInk: '#344463', secondFill: '#edf4fc', nodeFill: '#f1f6fa',
    border: '#a4b9d0', accent: '#796697', line: '#65758f',
    radius: 13, borderWidth: 0.9, lineWidth: 1.3, lineStyle: 'curve',
    rootSize: 28, secondSize: 21, nodeSize: 17, spacing: [60, 20], padding: [22, 12],
    shadow: ['#7a94aa', 1, 5, 3], levels: { root: { paddingX: 36, paddingY: 24 }, node: { borderColor: '#b6c5d3', borderRadius: 8 } }
  },
  {
    slug: 'vintage-editorial', name: 'Vintage Editorial', zh: '复古书刊', category: 'graphic',
    description: 'Serif hierarchy · letterpress rules', descriptionZh: '宋体活版 · 书刊细线',
    font: 'serif', dark: false, background: '#f3ead8', ink: '#493c30',
    rootFill: '#493c30', rootInk: '#fff4db', secondFill: '#e5dac3', nodeFill: 'transparent',
    border: '#8e7a5e', accent: '#90452d', line: '#7d694f',
    radius: 0, borderWidth: 0, lineWidth: 1.25, lineStyle: 'straight',
    rootSize: 32, secondSize: 22, nodeSize: 18, spacing: [72, 17], padding: [18, 10],
    shadow: ['#8e7a5e', 0, 0, 0], levels: { root: { paddingX: 24, paddingY: 25, fontWeight: 700 }, second: { fontWeight: 600 }, node: { paddingY: 8 } }
  },
  {
    slug: 'celestial-atlas', name: 'Celestial Atlas', zh: '星象图鉴', category: 'graphic',
    description: 'Orbital arcs · gold and starlight', descriptionZh: '轨道弧线 · 金银星图',
    font: 'serif', dark: true, background: '#1b263d', ink: '#e4dfcf',
    rootFill: '#24334d', rootInk: '#f8e4b2', secondFill: '#24334d', nodeFill: 'transparent',
    border: '#bba477', accent: '#dfbd79', line: '#8d9bb1',
    radius: 28, borderWidth: 0.9, lineWidth: 1, lineStyle: 'curve',
    rootSize: 29, secondSize: 22, nodeSize: 18, spacing: [72, 22], padding: [24, 11],
    shadow: ['#111a2c', 0, 0, 0], levels: { root: { shape: 'ellipse', paddingX: 36, paddingY: 24 }, node: { borderWidth: 0, paddingX: 14 } }
  },
  {
    slug: 'swiss-type', name: 'Swiss Type', zh: '瑞士排版', category: 'graphic',
    description: 'Type hierarchy · editorial baseline', descriptionZh: '醒目标题 · 开放排版', keywords: '汇报 研究 modern typography',
    font: 'sans', dark: false, background: '#fafaf7', ink: '#20282a',
    rootFill: 'transparent', rootInk: '#172023', secondFill: '#f0f0eb', nodeFill: 'transparent',
    border: '#273236', accent: '#be352e', line: '#6c7375',
    radius: 0, borderWidth: 0, lineWidth: 1.3, lineStyle: 'straight',
    rootSize: 38, secondSize: 22, nodeSize: 17, spacing: [80, 20], padding: [18, 10],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 20, paddingY: 24, fontWeight: 700 }, second: { fontWeight: 700 } }
  },
  {
    slug: 'metro-transit', name: 'Metro Transit', zh: '地铁导览', category: 'graphic',
    description: 'Interchange rings · colored routes', descriptionZh: '换乘圆环 · 彩色线路', keywords: '学习 路径 站点 map route',
    font: 'sans', dark: false, background: '#f6f8f7', ink: '#243b48',
    rootFill: '#f6f8f7', rootInk: '#213c51', secondFill: '#ffffff', nodeFill: 'transparent',
    border: '#285772', accent: '#a73835', line: '#285772', branchPalette: ['#276a84', '#a33f3c', '#4b783f', '#865b2c', '#75609b', '#2b7770'],
    radius: 30, borderWidth: 2, lineWidth: 3, lineStyle: 'straight', lineRadius: 12,
    rootSize: 28, secondSize: 21, nodeSize: 17, spacing: [76, 23], padding: [22, 10],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 38, paddingY: 23, borderWidth: 3, fontWeight: 700 }, node: { borderWidth: 0, paddingX: 19 } }
  },
  {
    slug: 'chalk-classroom', name: 'Chalk Classroom', zh: '黑板课堂', category: 'paper',
    description: 'Chalk brackets · open board notes', descriptionZh: '粉笔括线 · 开放板书', keywords: '教学 课堂 handwritten school',
    font: 'hand', dark: true, background: '#203d36', ink: '#f0eedb',
    rootFill: 'transparent', rootInk: '#fff3ba', secondFill: 'transparent', nodeFill: 'transparent',
    border: '#d2dfca', accent: '#e8ce85', line: '#b6cbbb',
    radius: 0, borderWidth: 0, lineWidth: 1.7, lineStyle: 'curve',
    rootSize: 34, secondSize: 25, nodeSize: 21, spacing: [66, 20], padding: [20, 12],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 32, paddingY: 25 }, second: { paddingX: 24 } }
  },
  {
    slug: 'terminal-tree', name: 'Terminal Tree', zh: '终端目录', category: 'technical',
    description: 'Prompt marks · quiet directory lines', descriptionZh: '提示符号 · 极简目录', keywords: '代码 技术 目录 console code',
    font: 'sans', dark: true, background: '#17201d', ink: '#d1ded3',
    rootFill: 'transparent', rootInk: '#b7e0a3', secondFill: 'transparent', nodeFill: 'transparent',
    border: '#92ad91', accent: '#d8c188', line: '#819a85',
    radius: 0, borderWidth: 0, lineWidth: 1.2, lineStyle: 'straight', lineRadius: 0,
    rootSize: 27, secondSize: 20, nodeSize: 17, spacing: [64, 16], padding: [17, 9],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 35, paddingY: 18, fontWeight: 600 }, second: { paddingX: 23 } }
  },
  {
    slug: 'circuit-board', name: 'Circuit Board', zh: '印刷电路', category: 'technical',
    description: 'Copper pads · component outlines', descriptionZh: '铜色焊盘 · 芯片轮廓', keywords: '硬件 系统 electronics hardware',
    font: 'tech', dark: true, background: '#193b32', ink: '#e2eed9',
    rootFill: '#183129', rootInk: '#f7e6b8', secondFill: '#254b3e', nodeFill: 'transparent',
    border: '#c9ad6f', accent: '#e1be78', line: '#b7b77b',
    radius: 3, borderWidth: 1.4, lineWidth: 2, lineStyle: 'straight', lineRadius: 6,
    rootSize: 31, secondSize: 23, nodeSize: 18, spacing: [76, 22], padding: [24, 12],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 40, paddingY: 27 }, node: { borderWidth: 0, paddingX: 20 } }
  },
  {
    slug: 'art-deco', name: 'Art Deco', zh: '装饰艺术', category: 'graphic',
    description: 'Stepped frames · architectural gold', descriptionZh: '阶梯双框 · 建筑金线', keywords: '展览 文化 formal geometry',
    font: 'serif', dark: true, background: '#25303a', ink: '#f1e9d6',
    rootFill: '#273540', rootInk: '#f7dfaa', secondFill: '#2c3c47', nodeFill: 'transparent',
    border: '#c7ab77', accent: '#e3bf7c', line: '#b39c77',
    radius: 0, borderWidth: 1, lineWidth: 1.4, lineStyle: 'straight', lineRadius: 0,
    rootSize: 30, secondSize: 22, nodeSize: 18, spacing: [78, 23], padding: [26, 12],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 43, paddingY: 29 }, node: { borderWidth: 0, paddingX: 17 } }
  },
  {
    slug: 'risograph', name: 'Risograph', zh: '孔版叠印', category: 'paper',
    description: 'Two inks · offset print edges', descriptionZh: '双墨错版 · 锐利字面', keywords: '印刷 独立刊物 print ink',
    font: 'sans', dark: false, background: '#faf0db', ink: '#3d4658',
    rootFill: '#dc573c', rootInk: '#281d27', secondFill: '#bdd8db', nodeFill: 'transparent',
    border: '#385e78', accent: '#a6352a', line: '#526e7a',
    radius: 0, borderWidth: 0, lineWidth: 2, lineStyle: 'direct',
    rootSize: 32, secondSize: 23, nodeSize: 18, spacing: [64, 21], padding: [22, 11],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 33, paddingY: 23, fontWeight: 700 }, second: { fontWeight: 600 } }
  },
  {
    slug: 'memphis-play', name: 'Memphis Play', zh: '孟菲斯拼趣', category: 'play',
    description: 'Asymmetric pieces · playful patterns', descriptionZh: '偏置拼块 · 波点节奏', keywords: '活动 创意 workshop pattern',
    font: 'comic', dark: false, background: '#faf3e5', ink: '#30344c',
    rootFill: '#f49c8a', rootInk: '#382b44', secondFill: '#a7d7d1', nodeFill: '#f7e1a4',
    border: '#444766', accent: '#655c98', line: '#655c98',
    radius: 0, borderWidth: 1.2, lineWidth: 2, lineStyle: 'curve',
    rootSize: 30, secondSize: 23, nodeSize: 19, spacing: [66, 22], padding: [23, 12],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 39, paddingY: 27 }, node: { borderWidth: 0, borderRadius: 4, paddingY: 8 } }
  },
  {
    slug: 'neo-brutalist', name: 'Neo Brutalist', zh: '新粗野派', category: 'graphic',
    description: 'Hard blocks · decisive offset shadows', descriptionZh: '厚黑硬边 · 块面投影', keywords: '产品 策略 bold block',
    font: 'sans', dark: false, background: '#f2f1ea', ink: '#202224',
    rootFill: '#d4ef60', rootInk: '#202224', secondFill: '#d0b7ec', nodeFill: '#fffdf4',
    border: '#202224', accent: '#5b4793', line: '#303431',
    radius: 0, borderWidth: 3, lineWidth: 2.5, lineStyle: 'direct',
    rootSize: 33, secondSize: 22, nodeSize: 17, spacing: [72, 23], padding: [21, 11],
    shadow: ['#202224', 5, 5, 0], shadowOpacity: 1, levels: { root: { paddingX: 31, paddingY: 24, fontWeight: 700, borderWidth: 4 }, second: { fontWeight: 700 }, node: { borderWidth: 1.2 } }
  },
  {
    slug: 'retro-desktop', name: 'Retro Desktop', zh: '复古桌面', category: 'technical',
    description: 'Beveled windows · clean file labels', descriptionZh: '经典窗口 · 文件标签', keywords: '电脑 系统 windows computer',
    font: 'sans', dark: false, background: '#d5e1df', ink: '#263543',
    rootFill: '#d7d9d9', rootInk: '#202b38', secondFill: '#e6e7e5', nodeFill: '#f5f6f1',
    border: '#62767b', accent: '#254f83', line: '#4e6c76',
    radius: 0, borderWidth: 1, lineWidth: 1.4, lineStyle: 'straight', lineRadius: 0,
    rootSize: 27, secondSize: 20, nodeSize: 17, spacing: [66, 19], padding: [20, 12],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 31, paddingY: 26 }, second: { paddingY: 19 }, node: { borderWidth: 0, paddingX: 21, paddingY: 8 } }
  },
  {
    slug: 'stitched-linen', name: 'Stitched Linen', zh: '布艺刺绣', category: 'material',
    description: 'Fabric patches · restrained stitches', descriptionZh: '柔软布签 · 细密缝线', keywords: '生活 手作 textile craft',
    font: 'hand', dark: false, background: '#f0eadc', ink: '#514943',
    rootFill: '#d2ded1', rootInk: '#344c42', secondFill: '#e5bbae', nodeFill: 'transparent',
    border: '#8d6859', accent: '#745348', line: '#81705b',
    radius: 12, borderWidth: 1, lineWidth: 1.5, lineStyle: 'curve',
    rootSize: 31, secondSize: 24, nodeSize: 20, spacing: [64, 21], padding: [25, 13],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 38, paddingY: 25 }, node: { borderWidth: 0, paddingX: 18, paddingY: 10 } }
  },
  {
    slug: 'clay-studio', name: 'Clay Studio', zh: '软陶工坊', category: 'material',
    description: 'Matte rounded forms · soft relief', descriptionZh: '哑光圆润 · 轻柔厚度', keywords: '陶土 圆角 温暖 warm soft',
    font: 'sans', dark: false, background: '#efe8df', ink: '#51433b',
    rootFill: '#ddae91', rootInk: '#503a2b', secondFill: '#c0d0b6', nodeFill: '#f7f0e7',
    border: '#b48e74', accent: '#885b44', line: '#87725a',
    radius: 23, borderWidth: 0, lineWidth: 2.6, lineStyle: 'curve',
    rootSize: 30, secondSize: 22, nodeSize: 18, spacing: [68, 23], padding: [26, 14],
    shadow: ['#8b705d', 2, 5, 2], levels: { root: { paddingX: 39, paddingY: 25 }, node: { borderRadius: 10, paddingY: 9 } }
  },
  {
    slug: 'stained-glass', name: 'Stained Glass', zh: '彩窗玻璃', category: 'material',
    description: 'Jewel inlays · dark lead outlines', descriptionZh: '宝石分片 · 深色铅线', keywords: '艺术 神话 mosaic jewel',
    font: 'serif', dark: false, background: '#f0e9db', ink: '#354347',
    rootFill: '#f7ebcf', rootInk: '#313c45', secondFill: '#e4ebd9', nodeFill: '#f7f1e3',
    border: '#394b50', accent: '#934c43', line: '#4c635c',
    radius: 0, borderWidth: 2.3, lineWidth: 2.3, lineStyle: 'straight',
    rootSize: 30, secondSize: 22, nodeSize: 18, spacing: [74, 23], padding: [27, 14],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 44, paddingY: 29 }, node: { borderWidth: 0.8, paddingX: 16, paddingY: 8 } }
  },
  {
    slug: 'topographic', name: 'Topographic', zh: '地形探险', category: 'graphic',
    description: 'Map plates · quiet contour lines', descriptionZh: '地图图签 · 克制等高线', keywords: '旅行 探索 户外 hiking map',
    font: 'sans', dark: false, background: '#f1f0e1', ink: '#3c4939',
    rootFill: '#4e634a', rootInk: '#fff6d9', secondFill: '#dde3c6', nodeFill: 'transparent',
    border: '#637359', accent: '#97603b', line: '#617451',
    radius: 0, borderWidth: 1, lineWidth: 1.8, lineStyle: 'direct',
    rootSize: 28, secondSize: 21, nodeSize: 17, spacing: [70, 21], padding: [24, 12],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 36, paddingY: 24 }, node: { borderWidth: 0, paddingX: 18 } }
  },
  {
    slug: 'film-storyboard', name: 'Film Storyboard', zh: '胶片分镜', category: 'graphic',
    description: 'Frame borders · title-tier sprockets', descriptionZh: '画幅边框 · 胶片齿孔', keywords: '视频 故事 电影 cinema story',
    font: 'sans', dark: false, background: '#e9e7e1', ink: '#3b3d3e',
    rootFill: '#343c41', rootInk: '#faf7ed', secondFill: '#faf7ee', nodeFill: 'transparent',
    border: '#52585b', accent: '#985c3b', line: '#636568',
    radius: 2, borderWidth: 1.5, lineWidth: 1.4, lineStyle: 'straight', lineRadius: 0,
    rootSize: 29, secondSize: 21, nodeSize: 17, spacing: [74, 22], padding: [28, 14],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 42, paddingY: 28 }, node: { borderWidth: 0, paddingX: 16, paddingY: 8 } }
  },
  {
    slug: 'travel-tickets', name: 'Travel Tickets', zh: '旅行票根', category: 'paper',
    description: 'Notched tickets · perforated margins', descriptionZh: '票根缺口 · 边缘穿孔', keywords: '旅行 愿望 收藏 journey ticket',
    font: 'serif', dark: false, background: '#f7eedc', ink: '#514637',
    rootFill: '#ecd097', rootInk: '#443828', secondFill: '#d4e3dd', nodeFill: '#fbf7ed',
    border: '#977e5c', accent: '#a15138', line: '#826d50',
    radius: 0, borderWidth: 1, lineWidth: 1.4, lineStyle: 'curve',
    rootSize: 29, secondSize: 22, nodeSize: 18, spacing: [67, 21], padding: [27, 13],
    shadow: ['#000000', 0, 0, 0], levels: { root: { paddingX: 42, paddingY: 25 }, node: { borderWidth: 0.7, paddingX: 23, paddingY: 9 } }
  }
]
