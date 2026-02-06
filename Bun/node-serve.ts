import http from "http";

const host = "localhost";
const port = 3002;

const app = http.createServer((req, res) => {
  res.setHeader("Content-Type", "	text/plain;charset=utf-8");
  res.write("Hello Node");
  res.end();
});

app.listen(port, host);

console.log(`Server is running at http://localhost:${port}`);
