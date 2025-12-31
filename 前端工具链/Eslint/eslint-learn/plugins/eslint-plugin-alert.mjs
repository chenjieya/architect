export default {
  meta: {
    type: "problem"
  },
  rules: {
    "no-alert": {
      create: (context) => {
        return {
          CallExpression(node) {
            if (node.callee.object && node.callee.object.name === "alert") {
              context.report({
                node,
                message: "不允许使用alert"
              });
            }
          }
        };
      }
    }
  }
};
