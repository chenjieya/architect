const baseConfig = require('./webpack.base.js');
const { merge } = require('webpack-merge');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
// const HtmlWebpackTagsPlugin = require('html-webpack-tags-plugin');
// const webpack = require("webpack");
// const path = require('path');

// const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const CompressionPlugin = require('compression-webpack-plugin');

/**
 * @type {import('webpack').Configuration}
 */
const prodConfig = {
  mode: 'production',
  // devtool: 'source-map',
  plugins: [
    // new webpack.DllReferencePlugin({
    //   manifest: path.resolve(__dirname, '../dll/vendor-manifest.json')
    // }),
    // new HtmlWebpackTagsPlugin({
    //   append: false, // 在其他标签之前添加标签
    //   publicPath: '/', // 添加的标签路径前缀
    //   tags: ['dll/vendor.dll.js'], // 添加的标签
    // }),
    // new BundleAnalyzerPlugin(),
    new CompressionPlugin({
      algorithm: "brotliCompress", // 压缩算法，默认gzip，也可以是brotliCompress
      test: /\.(js|css)(\?.*)?$/i, //需要压缩的文件正则
      threshold: 1024, //文件大小大于这个值时启用压缩
      deleteOriginalAssets: true //压缩后是否删除原文件
    })
  ],
  // externals: {
  //   vue: 'Vue',
  //   "vue-router": "VueRouter",
  //   "element-plus": "ElementPlus",
  //   "@vueuse/core": "VueUse",
  //   echarts: 'echarts',
  //   "vue-echarts": "VueECharts",
  // },
  performance: {
    // hints: false, // 关闭性能提示
    maxEntrypointSize: 512000, // 入口文件大小，性能提示
    maxAssetSize: 512000, // 单个文件大小，性能提示
  },
  optimization: {
    minimize: true, // 默认就会使用terser-webpack-plugin来压缩代码
    minimizer: [
      new CssMinimizerPlugin(),
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false, // 不保留注释
          },
          compress: {
            drop_console: true, // 删除console.log
            drop_debugger: true, // 删除debugger
            pure_funcs: ['console.log','console.error','console.info'] // 删除console相关打印语句
          }
        },
        extractComments: false, // 不将注释提取到单独的文件中
      }),
      // "..." // 使用默认的压缩器
      // new ImageMinimizerPlugin({
      //   minimizer: {
      //     implementation: ImageMinimizerPlugin.imageminGenerate,
      //     options: {
      //       plugins: [
      //         ["gifsicle", { interlaced: true }],
      //         ["jpegtran", { progressive: true }],
      //         ["optipng", { optimizationLevel: 5 }],
      //         [
      //           "svgo",
      //           {
      //             plugins: [
      //               "preset-default",
      //               "prefixIds",
      //               {
      //                 name: "sortAttrs",
      //                 params: {
      //                   xmlnsOrder: "alphabetical",
      //                 },
      //               },
      //             ],
      //           },
      //         ],
      //       ],
      //     },
      //   },
      // }),
    ],
    chunkIds: "named",
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          name: 'chunk-vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          reuseExistingChunk: true,
          // chunks:'async'
        },
        element: {
          name: 'chunk-element',
          test: /[\\/]node_modules[\\/]element(.*)/,
          priority: 20,
          reuseExistingChunk: true,
        },
        echarts: {
          name: 'chunk-echarts',
          test: /[\\/]node_modules[\\/]echarts|zrender(.*)/,
          priority: 20,
          reuseExistingChunk: true,
        },
        commons: {
          name: 'chunk-commons',
          minChunks: 2, // 为了演示效果，只要引用了2次以上就会打包成单独的js
          priority: 5,
          minSize: 0, // 为了演示效果，设为0字节，实际情况根据自己的项目需要设定
          reuseExistingChunk: true,
        },
        lib: {
          test(module) { 
            // console.log(module.size())
            // console.log(module.nameForCondition())
            // console.log(module.context)
            // 如果模块大于160kb，并且模块名字中包含node_modules, 就会被单独打包到一个文件中
            return module.size() > 160000 && 
              module.nameForCondition() && module.nameForCondition().includes('node_modules')
          },
          name(module) { 
            const packageNameArr = module.context.match(/[\\/]node_modules[\\/]\.pnpm[\\/](.*?)(\/|$)/)
            const packageName = packageNameArr ? packageNameArr[1] : ''
            return `chunk-lib.${packageName.replace(/[@+]/g,"")}`;
          },
          priority: 20,
          minChunks: 1,
          reuseExistingChunk: true,
        },
        module: {
          test: /[\\/]node_modules[\\/]/,
          name(module) { 
            const packageNameArr = module.context.match(/[\\/]node_modules[\\/]\.pnpm[\\/](.*?)(\/|$)/)
            const packageName = packageNameArr ? packageNameArr[1] : ''
            return `chunk-module.${packageName.replace(/[@+]/g,"")}`;
          },
          priority: 15,
          minChunks: 1,
          reuseExistingChunk: true,
        }
      }
    }
  },
}

module.exports = merge(baseConfig, prodConfig);