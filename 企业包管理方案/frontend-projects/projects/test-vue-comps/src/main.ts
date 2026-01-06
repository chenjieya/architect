import { createApp } from "vue";
import App from "./App.vue";

// 从工作空间引入组件库
import vuecoms from "vue-comps";
import "vue-comps/assets/style.css";
import "vue-comps/assets/font.scss";

const app = createApp(App);

// 背后就是执行 vuecoms 入口文件 lib.ts 里面的 install 方法
app.use(vuecoms);

app.mount("#app");
