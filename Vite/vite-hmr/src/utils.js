/**
 *如果 utils.js 更新，传播过程会再次递归地检查其导入器。首先，我们会找到 app.js 作为已接受的模块，并在此处停止传播。然后，我们也会递归地检查 other.js 及其导入器，但此时没有已接受的模块，因此会到达“根” index.html 文件。如果至少存在一个没有已接受模块的情况，则会触发页面完全重新加载。
 */
export function util(file) {
  console.log(`${file} => utils`);
  return "utils";
}
