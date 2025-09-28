(function () {
  'use strict';

  var fn = function fn() {
    console.log("fns");
    return [1, 2, 3, 4].map(function (item) {
      return item + 1;
    });
  };
  var getTextss = function getTextss(text) {
    return text;
  };
  fn();
  var a = getTextss("hello world");
  console.log(a);
})();
