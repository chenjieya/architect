import { RollupOptions } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs"; // 将 CommonJS 模块转换为 ES6
import typescript from "@rollup/plugin-typescript"; // 解析 TypeScript
import babel from "@rollup/plugin-babel"; // 解析最新的 JavaScript 语法
import htmlTemplate from "rollup-plugin-generate-html-template"; // 生成 HTML 文件
import alias from "@rollup/plugin-alias"; // 处理路径别名
import { fileURLToPath } from "node:url";
import postcss from "rollup-plugin-postcss"; // 处理 CSS 文件
import image from "@rollup/plugin-image"; // 处理图片文件
import replace from "@rollup/plugin-replace";
import clear from "rollup-plugin-clear"; // 清理输出目录
import serve from "rollup-plugin-serve"; // 本地服务器
import livereload from "rollup-plugin-livereload"; // 热更新

const config: RollupOptions = {
  input: "src/main.tsx", // 入口文件
  output: {
    dir: "dist", // 输出目录
    format: "esm", // 输出格式
    name: "rollupDemo",
    sourcemap: true // 生成 source map 文件
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript(),
    // 尽量放在前面，确保在其他插件生产文件之前，清空输出目录
    clear({
      targets: ["dist"]
    }),
    babel({
      babelHelpers: "runtime",
      include: "src/**",
      exclude: "node_modules/**",
      extensions: [".js", ".ts", ".tsx"]
    }),
    alias({
      entries: [
        {
          find: "@",
          replacement: fileURLToPath(new URL("src", import.meta.url))
        } // 设置路径别名
      ]
    }),
    postcss({
      extensions: [".css", ".scss"],
      extract: true,
      modules: true
    }),
    image(), // 处理图片文件
    replace({
      preventAssignment: true,
      "process.env.NODE_ENV": JSON.stringify("production")
    }),
    serve({
      open: true,
      contentBase: ["dist"],
      port: 3000
    }),
    livereload({
      watch: "src",
      verbose: true
    }),
    htmlTemplate({
      template: "public/index.html",
      target: "dist/index.html",
      attrs: ['type="module"']
    })
  ]
};

export default config;
