// @ts-check
import { defineConfig } from "rollup";
import { babel } from "@rollup/plugin-babel";
import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import clear from "rollup-plugin-clear";

export default defineConfig({
  input: "./src/index.ts",
  output: [
    {
      file: "dist/tools.esm.js",
      format: "es"
    },
    {
      file: "dist/tools.cjs.js",
      format: "cjs"
    },
    {
      file: "dist/tools.umd.js",
      format: "umd",
      name: "MyTools" // umd 必须指定全局变量名
    }
  ],
  external: ["tslib"],
  plugins: [
    clear({
      // 核心选项：指定要清空的目录
      targets: ["dist"],
      watch: true // 在监听（watch）模式下也清空，默认为 true
    }),
    nodeResolve({
      extensions: [".js", ".jsx", ".ts", ".tsx"]
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      exclude: ["**/*.test.ts"]
    }),
    babel({
      babelHelpers: "runtime",
      exclude: "node_modules/**", // 排除 node_modules
      extensions: [".js", ".jsx", ".ts", ".tsx"] // 要处理的文件扩展名
    })
  ]
});
