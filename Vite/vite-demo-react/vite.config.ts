import { defineConfig, loadEnv } from "vite";
import path from "path";
import react from "@vitejs/plugin-react";

// export default defineConfig({
//   server: {
//     port: 3000,
//     open: false
//   }
// });

export default defineConfig(({ command, mode }) => {
  // console.log(command, "command");
  // console.log(mode, "mode");
  // 默认读取的是node环境
  // console.log(process.env);
  const root = process.cwd();

  const { VITE_PORT, VITE_OPEN, VITE_DROP_CONSOLE } = loadEnv(
    mode,
    root,
    "VITE"
  );
  // { VITE_TITLE: 'VITE TITLE', VITE_PORT: '5173' }
  console.log(VITE_OPEN);
  console.log(JSON.parse(VITE_OPEN || "true"));
  return {
    plugins: [react()],
    server: {
      port: Number(VITE_PORT),
      open: JSON.parse(VITE_OPEN || "true")
    },
    esbuild: {
      drop: JSON.parse(VITE_DROP_CONSOLE || "true")
        ? ["console", "debugger"]
        : []
    }
  };
});
