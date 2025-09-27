import path from "path";
import fs from "fs/promises";

export default function () {
  return {
    name: "esbuild-plugin-txt",
    setup(build) {
      // 处理路径
      build.onResolve({ filter: /\.txt$/ }, (args) => {
        console.log(args, "args");
        return {
          path: path.join(args.resolveDir, args.path),
          namespace: "alvis-txt"
        };
      });

      // 处理txt内容
      build.onLoad({ filter: /.*/, namespace: "alvis-txt" }, async (args) => {
        const text = await fs.readFile(args.path, "utf-8");
        const arr = text.split(/\s+/);
        console.log(arr, "arr");
        const obj = arr.reduce((prev, item) => {
          const [key, value] = item.split("=");
          prev[key] = value;
          return prev;
        }, {});

        console.log(obj, "obj");
        return {
          contents: JSON.stringify(obj),
          loader: "json"
        };
      });
    }
  };
}
