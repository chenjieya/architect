// 插件 --- 收集需要预构建的依赖路径
export default function esbuildPluginPrebundle(deps) {
  return {
    name: "esbuild-plugin-prebundle",
    setup(build) {
      build.onResolve({ filter: /^[^\.]/ }, (args) => {
        deps.add(args.path);

        // 扫描阶段不需要真正打包
        return {
          path: args.path,
          external: true
        };
      });
    }
  };
}

// (async () => {
//   // 扫描文件
//   await esbuild.build({
//     // 不将打包内容写入磁盘中
//     write: false,
//     entryPoints: ["src/index.js"],
//     bundle: true,
//     outdir: "./dist",
//     loader: {
//       ".js": "jsx",
//       ".png": "dataurl",
//       ".svg": "dataurl"
//     },
//     plugins: [esbuildPluginPrebundle(deps)]
//   });

//   // 打包输出
//   await esbuild.build({
//     // 入口文件就是上面扫描的地址
//     entryPoints: [...deps],
//     write: true,
//     bundle: true,
//     format: "esm",
//     outdir: "./node_modules/.vite/deps"
//   });
// })();
