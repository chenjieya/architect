// 我们的直接依赖是express，npm安装的依赖会直接将 express包的依赖，平铺的当前项目的node_modules项目中
const bodyParser = require("body-parser");

/**
 * [Function: bodyParser] {
  json: [Getter],
  raw: [Getter],
  text: [Getter],
  urlencoded: [Getter]
}
 */
console.log(bodyParser);
