import debounce from "./node_modules/lodash-es/debounce.js";

function fn1() {
  console.log("module1");
}

debounce(fn1, 1000)();

export default fn1;
