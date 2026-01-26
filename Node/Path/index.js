const path = require("path");
// /Users/chenjie/Desktop/FutureArchitect/Node
require("../global");

const basename = path.basename("aca/acnaksd/ahks/a.html");

// a  他不会校验 文件路径是否存在， 只返回最后的那个
const basename1 = path.basename("aca/acnaksd/ahks/a");

console.log(basename1);

const sep = path.sep;
// 分隔符 -- 文件路径的分隔符
console.log(sep);

// 系统环境变量的分隔符
console.log(path.delimiter);
// console.log(process.env.PATH.split(path.delimiter));

// dirname和basename一样，都不会去校验路径是否存在，他是和basename相反
console.log(path.dirname("anc/ahkdlaj/c"));

console.log(path.extname("./dajsd/adjsla.js"));
// 返回空串
console.log(path.extname("./dajsd/adjsla"));
// 返回空串
console.log(path.extname("/dajsd/adjsla"));

// 输出: '/foo/bar/baz/asdf' - 注意 '..' 被解析了
console.log(path.join("/foo", "bar", "baz/asdf", "quux", ".."));

// 输出: 'foo/baz' - './' 和 '../' 被正确解析
console.log(path.join("foo", "./bar", "../baz"));

// 输出: '/foo/bar/baz/asdf'  解析. ..
console.log(path.normalize("/foo/bar//baz/asdf/quux/.."));

// form to  from到to 的相对路径  ../../d/a
console.log(path.relative("/abc/ab/c", "/abc/d/a"));

// 返回的是相对路径
console.log(path.resolve("/a.js"));
// 可以传递相对路径，是相对于你敲运行命令的那个目录
// /Users/chenjie/Desktop/FutureArchitect/Node/Path/a.js
console.log(path.resolve("./a.js"));

// 当前__dirname所在文件的目录，的绝对路径
console.log(__dirname);

// 当前__filename所在文件的绝对路径
console.log(__filename);
