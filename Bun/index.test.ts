import { test, expect } from "bun:test";

test("should return 200 OK", async () => {
  const response = await fetch("http://localhost:3000");
  // console.log(response);
  expect(response.status).toBe(200);
  const text = await response.text();
  expect(text).toBe("Hello Bun");
});
