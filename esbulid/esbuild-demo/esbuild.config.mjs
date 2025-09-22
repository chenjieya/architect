import esbuild from "esbuild";
import esbuildPluginTime from './plugins/esbuild-plugin-time.js'

(async () => {
  const ctx = await esbuild.context({
    // 入口文件
    entryPoints: ["src/index.js"],
    // bundle 打包
    bundle: true,
    // 打包输出文件夹
    outdir: "public",
    sourcemap: true,
    minify: true,
    target: ["es2020", "chrome58", "firefox57", "safari11"],
    loader: {
      ".js": "jsx",
      ".png": "dataurl",
      ".svg": "dataurl"
    },
    plugins: [
      esbuildPluginTime()
    ]
  });

  ctx.watch();
  ctx
    .serve({
      servedir: "public",
      port: 3000,
      host: "0.0.0.0"
    })
    .then((res) => {
      console.log("http://localhost:" + res.port);
    });
})();
