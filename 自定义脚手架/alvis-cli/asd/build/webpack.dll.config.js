const webpack = require('webpack');
const path = require('path');

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  entry: {
    vendor: [
      'vue',
      'vue-router',
      'element-plus',
      'echarts',
      'vue-echarts',
      '@vueuse/core'
    ]
  },
  mode: 'production',
  output: {
    filename: '[name].dll.js',
    library: '[name]', // vendor.dll.js中暴露出的全局变量名
    path: path.join(__dirname, '../dll'), // 生成文件的目录
  },
  plugins: [
    new webpack.DllPlugin({
      name: "[name]", // 全局变量名称，较少搜索范围，和output.library保持一致
      path: path.join(__dirname, '../dll/[name]-manifest.json'), // 生成清单文件
    })
  ]
}