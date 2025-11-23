import { defineConfig } from "rollup";
import terser from '@rollup/plugin-terser';
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";

export default defineConfig({
  input: "./src/index.ts",
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'es'
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'jstp' // umd 必须指定全局变量名
    }
  ],
  plugins: [
    typescript({
      declaration: true,
      declarationDir: "dist",
      declarationMap: false,
      outDir: "dist",
      exclude: ["**/*.test.ts", "**/*.spec.ts"],
    }),
    commonjs(),
    nodeResolve(),
    terser() 
  ]
})