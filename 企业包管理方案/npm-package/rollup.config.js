import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";

const output = (file, format, name) => ({ file, format, name });

export default [
  {
    input: "src/index.js",
    output: [
      output("dist/index.cjs.js", "cjs"),
      output("dist/index.mjs.js", "es"),
      output("dist/index.umd.js", "umd", "Alvis")
    ],
    plugins: [
      nodeResolve({
        extensions: [".js"]
      }),
      commonjs(),
      terser()
    ]
  }
];
