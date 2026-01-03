const { minify } = require("terser");
const fs = require("fs");
const path = require("path");

const sourceCodePath = path.resolve("src", "index.js");

const outDir = "dist";

const outCodePath = path.resolve(outDir, "index.js");
const outSourceMapPath = path.resolve(outDir, "index.js.map");

const code = {
  "index.js": fs.readFileSync(sourceCodePath, { encoding: "utf-8" })
};

const options = {
  sourceMap: {
    filename: "index.js",
    url: "index.js.map"
  }
};

minify(code, options)
  .then((result) => {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    fs.writeFileSync(outCodePath, result.code);

    if (result.map) {
      fs.writeFileSync(outSourceMapPath, result.map);
    }

    console.log("压缩代码成功");
  })
  .catch(() => {
    console.log("压缩代码失败");
  });
