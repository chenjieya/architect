/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'vue/multi-word-component-names': 'off', // 默认vue文件必须大驼峰命名，off 关闭文件名称校验
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'off'
  },
  env: {
    node: true // 识别node配置
  }
}
