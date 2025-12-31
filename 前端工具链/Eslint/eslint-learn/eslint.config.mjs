import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";
import custom from "./plugins/index.mjs";

export default defineConfig([
  {
    files: ["**/index.{js,mjs,cjs}"],
    plugins: {
      js,
      custom: custom.pluginA,
      customB: custom.pluginB
    },
    extends: ["js/recommended"],
    languageOptions: { globals: globals.browser },
    rules: {
      "custom/no-console": "error",
      "customB/no-alert": "error"
    }
  },
  {
    files: ["**/*.{eslint}.{js}"],
    plugins: {},
    languageOptions: { globals: globals.node }
  }
]);
