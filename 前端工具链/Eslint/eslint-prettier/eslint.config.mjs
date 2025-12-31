import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'double'],
      semi: ['error', 'always'],
    },
  },
  // 将关闭和 prettier 冲突的 eslint，使用prettier
  eslintPluginPrettierRecommended,
  // 配置项之间隔离的是 files rules languageOptions settings等，不隔离的是 plugins processors，他们有一个插件池子，主要注册了插件，后面的都可以使用
  {
    rules: {
      // 这个规则就是 将规则 参数  传递给 prettier，然后覆盖perttier的默认配置
      'prettier/prettier': [
        'error',
        {
          singleQuote: true,
        },
      ],
    },
  },
]);
