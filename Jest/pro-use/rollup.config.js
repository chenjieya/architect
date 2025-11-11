import { defineConfig } from "rollup";
import generateHTML from "rollup-plugin-generate-html-template";
import clear from "rollup-plugin-clear";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "src/browser-index.ts",
  output: [
    {
      file: "dist/browser-index.js",
      format: "esm",
      sourcemap: true
    }
  ],
  plugins: [
    clear({
      targets: ["dist"],
      watch: true
    }),
    generateHTML({
      template: "./index.html"
    }),
    typescript()
  ]
});
