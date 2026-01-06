export default {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          browsers: ["> 1%", "last 2 versions"] // 针对使用率 >1% 的浏览器
          // node: "current" // 针对当前 Node.js 版本
        },
        modules: false
      }
    ]
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        corejs: 3, // 使用 core-js 3 进行 polyfill
        helpers: true, // 自动提取 helper 函数
        regenerator: true, // 使用 regenerator-runtime
        useESModules: true // 输出 ES 模块
      }
    ]
  ]
};
