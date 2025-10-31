import postcss from "rollup-plugin-postcss";
import { defineConfig } from "rollup";
import clear from "rollup-plugin-clear";
import generateHTML from "rollup-plugin-generate-html-template";

export default defineConfig({
  input: "src/index.js",
  output: {
    file: "dist/index.js",
    format: "esm"
  },
  external: ["./src/sourceCompiler.js"],
  plugins: [
    clear({
      // 核心选项：指定要清空的目录
      targets: ["dist"]
    }),
    postcss({
      // 1. 首先使用 Sass 预处理器编译 SCSS → CSS
      use: [
        [
          "sass",
          {
            // Sass 特定配置
            includePaths: ["src/assets"]
            // outputStyle: "expanded"
          }
        ]
      ],
      // 2. 然后使用 PostCSS 插件进行后处理
      // plugins: [
      //   // 添加浏览器前缀
      //   autoprefixer({
      //     overrideBrowserslist: ["last 2 versions", "> 1%"]
      //   }),
      //   // CSS 压缩和优化
      //   cssnano({
      //     preset: "default"
      //   })
      // ],

      // 其他配置
      extract: "index.css", // 输出到独立文件
      sourceMap: true,
      minimize: true
    }),
    generateHTML({
      // 核心选项：指定一个HTML模板
      template: "template.html",

      // 输出选项：生成的HTML文件名和路径
      filename: "index.html" // 默认也是 'index.html'

      // 注入选项：控制如何注入资源
      // links: [ { path: 'custom.css' } ] // 手动添加额外的link标签
    })
  ]
});
