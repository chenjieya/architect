import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel, { getBabelOutputPlugin } from "@rollup/plugin-babel";

export default {
  input: "./src/index.js",
  output: [
    {
      file: "lib/bundle.js",
      format: "iife",
      name: "bundle"
    },
    {
      file: "lib/bundle.es.js",
      format: "es"
    },
    {
      file: "lib/bundle.umd.js",
      format: "umd",
      name: "bundle"
    }
  ],
  watch: {
    exclude: "node_modules/**"
  },
  plugins: [
    getBabelOutputPlugin({
      presets: ["@babel/preset-env"],
      allowAllFormats: true
    }),
    resolve(),
    commonjs(),
    babel({
      babelHelpers: "bundled",
      exclude: "node_modules/**",
      extensions: [".js"]
    })
  ]
};
