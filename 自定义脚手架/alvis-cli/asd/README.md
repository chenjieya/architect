# Webpack + Vue3 + TS

自定义webpack配置处理Vue3 + TS程序
列举了Vue3+TS简单程序中常见的代码，如：
- axios + TS 封装
- 静态资源处理
- 图片懒加载 + 指令处理
- element-plus按需加载
- echarts按需加载
- mock模拟数据拦截

没有使用vue-cli等现有的脚手架，完全使用webpack自定义配置
- build/webpack.base.js 公共配置
- build/webpack.dev.js 开发模式配置
- build/webpack.prod.js 生产模式配置
- build/webpack.dll.config.js dll外链配置
