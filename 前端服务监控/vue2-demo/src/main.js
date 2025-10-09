import Vue from "vue";
import App from "./App.vue";
import router from "@/routes";
import bundle from "monitor-sdk";
import "./style.css";

Vue.config.productionTip = false;

bundle.start({
  vue: {
    Vue
  }
});

const app = new Vue({
  render: (h) => h(App),
  router
});
app.$mount("#app");
