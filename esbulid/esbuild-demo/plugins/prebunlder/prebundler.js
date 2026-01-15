import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import prebundleScanPlugin from "./esbuild-plugin-prebundle.js";

const deps = new Set();
const cacheDir = path.resolve("node_modules/.vite");
const depsDir = path.resolve(cacheDir, "deps");
const hashFile = path.resolve(cacheDir, "_metadata.json");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getDepsHash(deps) {
  return JSON.stringify([...deps].sort());
}
export async function prebundle() {
  ensureDir(cacheDir);
  ensureDir(depsDir);

  // 1️⃣ 扫描依赖
  await esbuild.build({
    entryPoints: ["src/index.js"],
    bundle: true,
    write: false,
    loader: {
      ".js": "jsx",
      ".png": "dataurl",
      ".svg": "dataurl"
    },
    plugins: [prebundleScanPlugin(deps)]
  });

  const hash = getDepsHash(deps);

  // 2️⃣ 判断是否需要重新预构建
  if (fs.existsSync(hashFile)) {
    const cached = JSON.parse(fs.readFileSync(hashFile, "utf-8"));
    if (cached.hash === hash) {
      console.log("✅ deps 未变化，跳过预构建");
      return;
    }
  }

  console.log("📦 预构建依赖:", [...deps]);

  // 3️⃣ 预构建 deps
  await esbuild.build({
    entryPoints: [...deps],
    bundle: true,
    format: "esm",
    splitting: false,
    outdir: depsDir,
    platform: "browser",
    target: "es2020"
  });

  // 4️⃣ 写缓存
  fs.writeFileSync(hashFile, JSON.stringify({ hash }, null, 2));
}
