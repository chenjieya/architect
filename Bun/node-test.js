import fetch from "node-fetch";

let count = 1000;
let err_count = 0;

const startTiem = new Date().getTime();

while (count > 0) {
  try {
    const res = await fetch("http://localhost:3002");
    res.text();
    count--;
  } catch {
    err_count++;
  }
}

const endTime = new Date().getTime();

console.log(`执行时间：${endTime - startTiem}`);
console.log(`错误数量：${err_count}`);
