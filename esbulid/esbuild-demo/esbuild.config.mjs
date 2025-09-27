import esbuild from "esbuild";
import esbuildPluginTime from "./plugins/esbuild-plugin-time.js";
import esbuildPluginClear from "./plugins/esbuild-plugin-clear.js";
import esbuildPluginHtml from "./plugins/esbuild-plugin-html.js";
import esbuildPluginExternalLodash from "./plugins/esbuild-plugin-external-lodash.js";
import esbuildPlugintxt from "./plugins/esbuild-plugin-txt.js";
import esbuildPluginMarkdown from "./plugins/esbuild-plugin-markdown.js";

(async () => {
  const productionMode = "production" === process.argv[2];

  const config = {
    // 入口文件
    // entryPoints: ["src/index.js", 'src/index.html'],
    entryPoints: ["src/index.js"],
    // bundle 打包
    bundle: true,
    // 打包输出文件夹
    outdir: "./dist",
    metafile: true,
    sourcemap: true,
    minify: true,
    // external: ['lodash-es'],
    platform: "browser",
    // 输出格式 iife, esm, cjs 默认是 iife，如果是 node 环境，默认为 cjs
    format: "esm",
    target: ["es2020", "chrome58", "firefox57", "safari11"],
    loader: {
      // ".html": "copy",
      ".js": "jsx",
      ".png": "dataurl",
      ".svg": "dataurl"
    },
    entryNames: "[dir]/[name]-[hash]",
    // chunkNames: 'chunks/[name]-[hash]',
    plugins: [
      esbuildPluginClear(),
      esbuildPluginTime(),
      esbuildPluginHtml(),
      esbuildPluginExternalLodash(),
      esbuildPlugintxt(),
      esbuildPluginMarkdown()
    ]
  };

  // 生产环境
  if (productionMode) {
    const ctx = await esbuild.build(config);
    // console.log(ctx, 'ctx')

    const text = await esbuild.analyzeMetafile(ctx.metafile, {
      verbose: true
    });
    console.log(text, "text");
  } else {
    // 开发环境
    const ctx = await esbuild.context(config);

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
  }
})();
