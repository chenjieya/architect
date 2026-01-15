// import path from "path";
export default function esbuildPluginResolve() {
  return {
    name: "esbuild-plugin-resolve",
    setup(build) {
      build.onResolve({ filter: /^[^\.]/ }, (args) => {
        return {
          path: `../node_modules/.vite/deps/${args.path}.js`,
          external: true
        };
      });
    }
  };
}
