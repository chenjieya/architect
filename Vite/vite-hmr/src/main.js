import "./app";

if (import.meta.hot) {
  import.meta.hot.accept(["./app.js"], ([newModule]) => {
    console.log(newModule);
  });
}
