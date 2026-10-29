const path = require('path')
const isLibrary = process.env.NODE_ENV === 'library'

module.exports = {
  publicPath: '/',
  outputDir: '../.output/public',
  lintOnSave: false,
  productionSourceMap: false,
  filenameHashing: true,
  parallel: 2,
  transpileDependencies: ['yjs', 'lib0', 'quill'],
  chainWebpack: config => {
    // 移除 preload 插件
    config.plugins.delete('preload')
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')
    // 给插入html页面内的js和css添加hash参数
    if (!isLibrary) {
      config.plugin('html').tap(args => {
        args[0].hash = true
        return args
      })
    }
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/'),
        'simple-mind-map': path.resolve(__dirname, '../simple-mind-map')
      }
    }
  },
  devServer: {
    proxy: {
      '^/api/': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true
      }
    }
  }
}
