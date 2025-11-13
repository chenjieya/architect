import { defineConfig } from "rollup";
import generateHTML from "rollup-plugin-generate-html-template";
import clear from "rollup-plugin-clear";
import typescript from "@rollup/plugin-typescript";

const BROWSER_OUTPUT_DIR = "dist/browser";
const TIMER_OUTPUT_DIR = "dist/timer";

function createPlugins(
  { typescriptOptions, generateHtmlOptions } = {
    typescriptOptions: {},
    generateHtmlOptions: {}
  }
) {
  return [
    typescript({
      declaration: false,
      // declarationDir: "dist",
      declarationMap: false,
      // 关键配置：确保输出的文件名正确
      outDir: "dist",
      rootDir: "src",
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
      ...typescriptOptions
    }),
    generateHTML({
      template: "./index.html",
      ...generateHtmlOptions
    })
  ];
}

// 浏览器环境案列
const buildBorwer = {
  input: "src/browser-index.ts",
  output: [
    {
      dir: BROWSER_OUTPUT_DIR,
      format: "esm",
      sourcemap: "inline"
    }
  ],
  plugins: [
    clear({
      targets: ["dist"],
      watch: true
    }),
    ...createPlugins({
      typescriptOptions: {
        // declarationDir: BROWSER_OUTPUT_DIR,
        outDir: BROWSER_OUTPUT_DIR
      },
      generateHtmlOptions: {
        template: "./index.html"
      }
    })
  ]
};

// 计时器案列
const buildTimer = {
  input: "src/timer-index.ts",
  output: [
    {
      dir: TIMER_OUTPUT_DIR,
      format: "esm",
      sourcemap: "inline"
    }
  ],
  plugins: [
    ...createPlugins({
      typescriptOptions: {
        // declarationDir: TIMER_OUTPUT_DIR,
        outDir: TIMER_OUTPUT_DIR
      },
      generateHtmlOptions: {
        template: "./timer.html"
      }
    })
  ]
};

export default defineConfig([buildBorwer, buildTimer]);
