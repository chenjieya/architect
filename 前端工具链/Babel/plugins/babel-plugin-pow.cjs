module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: "babel-plugin-pow",
    visitor: {
      BinaryExpression(path) {
        // console.log(path);

        if (path.node.operator !== "**") {
          return;
        }

        // 说明符合了条件 **
        // Math.pow()
        const mathpowAstNode = t.CallExpression(
          t.MemberExpression(t.Identifier("Math"), t.Identifier("pow")),
          [path.node.left, path.node.right]
        );

        // 用新的 AST 节点替换旧的 AST 节点
        path.replaceWith(mathpowAstNode);
      }
    }
  };
};
