Bun.serve({
  port: 3001,
  fetch() {
    return new Response("Hello Bun");
  }
});

console.log(`Server is running at http://localhost:${3001}`);
