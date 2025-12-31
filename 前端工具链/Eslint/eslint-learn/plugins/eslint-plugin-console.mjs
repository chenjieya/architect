export default {
  meta: {
    type: "problem"
  },
  rules: {
    "no-console": {
      create: (context) => {
        return {
          CallExpression(node) {
            if (
              node.callee.object &&
              node.callee.object.name === "console" &&
              node.callee.property.name === "log"
            ) {
              context.report({
                node,
                message: "不允许使用console.log"
              });
            }
          }
        };
      }
    }
  }
};
