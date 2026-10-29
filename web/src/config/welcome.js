// First-run content only. Existing browser documents keep their own data.
export default {
  root: {
    data: { text: 'Make room for ideas' },
    children: [
      {
        data: { text: 'Capture a thought' },
        children: [
          { data: { text: 'Double-click any node to write' } },
          { data: { text: 'Press Tab to add a branch' } }
        ]
      },
      {
        data: { text: 'Find the connections' },
        children: [
          { data: { text: 'Drag nodes to rearrange' } },
          { data: { text: 'Add a note, link, or image' } }
        ]
      },
      {
        data: { text: 'Make it yours' },
        children: [
          { data: { text: 'Choose a visual world in Themes' } },
          { data: { text: 'Export a copy to keep or share' } }
        ]
      }
    ]
  },
  layout: 'mindMap',
  theme: { template: 'mappop-anime-pop', config: {} },
  view: null
}
