const rollup = require("rollup");

const inputOptions = {
  input: "src/index.js",
  external: []
};

const outputOptions = {
  dir: "dist",
  sourcemap: false,
  format: "esm",
  entryFileNames: "[name].js"
};

async function build() {
  let bundle;
  let bundleFail = false;

  try {
    // 1. 打包构建过程
    bundle = await rollup.rollup(inputOptions);
    console.log(bundle);

    // 2. 输出构建结果

    // 2.1 生成输出结果到内存
    //   const resp = await bundle.generate(outputOptions);
    //   console.log(resp);

    // 2.2 写入到磁盘
    const resp = await bundle.write(outputOptions);
    console.log(resp);
  } catch {
    bundleFail = true;
  }

  if (bundle) {
    await bundle.close();
  }

  // process.exit(bundleFailed ? 1 : 0)
}

build();

const watchOptions = {
  ...inputOptions,
  output: [outputOptions],
  watch: {
    include: "src/**",
    exclude: "node_modules/**"
  }
};

const watcher = rollup.watch(watchOptions);
watcher.on("event", (event) => {
  console.log(event);
  if (event.code === "START") {
    // 开始打包
    console.log("开始打包");
  } else if (event.code === "BUNDLE_START") {
    // 某个文件开始打包
    console.log("某个文件开始打包");
  } else if (event.code === "BUNDLE_END") {
    // 某个文件打包结束
    console.log("某个文件打包结束");
    console.log(`耗时：${event.duration}ms`);
  } else if (event.code === "END") {
    // 打包结束
    console.log("打包结束");
  } else if (event.code === "ERROR") {
    // 打包出错
    console.log("打包出错");
    console.log(event.error);
  } else if (event.code === "FATAL") {
    // 打包出错，且无法继续监视
    console.log("打包出错，且无法继续监视");
    console.log(event.error);
  }

  if (event.result) {
    event.result.close();
  }
});
