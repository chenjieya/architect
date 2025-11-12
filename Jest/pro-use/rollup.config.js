import { defineConfig } from "rollup";
import generateHTML from "rollup-plugin-generate-html-template";
import clear from "rollup-plugin-clear";
import typescript from "@rollup/plugin-typescript";

const plugins = [
  clear({
    targets: ["dist"],
    watch: false
  }),
  typescript({
    declaration: true,
    declarationDir: "dist",
    declarationMap: true,
    // 关键配置：确保输出的文件名正确
    outDir: "dist",
    rootDir: "src",
    exclude: ["**/*.test.ts", "**/*.spec.ts"]
  })
];

// 浏览器环境案列
const buildBorwer = {
  input: "src/browser-index.ts",
  output: [
    {
      file: "dist/browser-index.js",
      format: "esm",
      sourcemap: true
    }
  ],
  plugins: [
    ...plugins,
    generateHTML({
      template: "./index.html"
    })
  ]
};

// 计时器案列
const buildTimer = {
  input: "src/timer-index.ts",
  output: [
    {
      file: "dist/timer-index.js",
      format: "esm",
      sourcemap: true
    }
  ],
  plugins: [
    ...plugins,
    generateHTML({
      template: "./timer.html"
    })
  ]
};

export default defineConfig([buildBorwer, buildTimer]);
