import esbuild from "esbuild";
import esbuildPluginTime from './plugins/esbuild-plugin-time.js'
import esbuildPluginClear from './plugins/esbuild-plugin-clear.js'
import esbuildPluginHtml from './plugins/esbuild-plugin-html.js'

(async () => {
  const ctx = await esbuild.context({
    // 入口文件
    // entryPoints: ["src/index.js", 'src/index.html'],
    entryPoints: ["src/index.js"],
    // bundle 打包
    bundle: true,
    // 打包输出文件夹
    outdir: "./dist",
    sourcemap: true,
    minify: true,
    target: ["es2020", "chrome58", "firefox57", "safari11"],
    loader: {
      // ".html": "copy",
      ".js": "jsx",
      ".png": "dataurl",
      ".svg": "dataurl"
    },
    // entryNames: '[dir]/[name]-[hash]',
    chunkNames: 'chunks/[name]-[hash]',
    plugins: [
      esbuildPluginClear(),
      esbuildPluginTime(),
      esbuildPluginHtml()
    ]
  });

  ctx.watch();
  ctx
    .serve({
      servedir: "dist",
      port: 3000,
      host: "0.0.0.0"
    })
    .then((res) => {
      console.log("http://localhost:" + res.port);
    });
})();
