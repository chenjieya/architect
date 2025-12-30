module.exports = {
  meta: {
    type: "problem"
  },
  create: (context) => {
    return {
      CallExpression(node) {
        console.log(node.callee);
      }
    };
  }
};
