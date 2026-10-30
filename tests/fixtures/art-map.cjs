// One unchanged, four-level document for every before/after capture.
const branch = (text, topics) => ({ data: { text }, children: topics.map(([text, a, b]) => ({ data: { text }, children: [{ data: { text: a } }, { data: { text: b } }] })) })
const artMap = {
  data: { text: '灵感生长 · Ideas in bloom' },
  children: [
    branch('观察 · Observe', [['城市的声音', '清晨，听见第一班车', 'Collect small moments'], ['自然的纹理', '叶脉与石头的年轮', '光落在纸上的形状']]),
    branch('联想 · Connect', [['跨越学科的连接', '艺术 × Engineering', '把问题换一个角度'], ['寻找共同语言', '从个人经验到集体记忆', 'What if we tried…?']]),
    branch('实验 · Explore', [['做一个小小的原型', '先验证，再完善', 'Prototype → feedback'], ['允许意外发生', '留一点空白给新的想法', '失败也是一种发现']]),
    branch('表达 · Express', [['让复杂变得清楚', '标题、层级与标点：都重要', '中文 / English / 123'], ['用画面讲述故事', '形状和连线一起说话', 'Design for understanding']]),
    branch('协作 · Together', [['认真倾听每个声音', '记录不同意见与未解问题', 'Share the context'], ['让行动有据可循', '谁来做？什么时候完成？', 'Small steps, real progress']]),
    branch('回望 · Reflect', [['保留有价值的过程', '整理笔记与参考资料', 'Archive the discoveries'], ['向下一次出发', '长期主义，从今天的一步开始', 'Make room for new ideas']])
  ]
}
const stressMap = { data: { text: '计算机网络' }, children: Array.from({ length: 12 }, (_, i) => ({ data: { text: `主题 ${i + 1}` }, children: Array.from({ length: 9 }, (_, j) => ({ data: { text: `知识点 ${i + 1}.${j + 1}` } })) })) }
module.exports = { artMap, stressMap }
