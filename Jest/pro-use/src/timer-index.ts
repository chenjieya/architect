import { startTimer, startTimerOut } from "./utils/timer";

const OstartBtn = document.getElementById("startTimerBtn") as HTMLButtonElement;
const OstoptBtn = document.getElementById("stopTimerBtn") as HTMLButtonElement;
const Onumber = document.getElementById("num1") as HTMLDivElement;

const OstartBtn2 = document.getElementById(
  "startTimeoutBtn"
) as HTMLButtonElement;
const OstoptBtn2 = document.getElementById(
  "stopTimeoutBtn"
) as HTMLButtonElement;
const Onumber2 = document.getElementById("num2") as HTMLDivElement;

let num: number = 0;
let clearTimer: () => void;
OstartBtn.addEventListener("click", () => {
  // 开始计时
  clearTimer = startTimer(() => {
    num++;
    Onumber.innerHTML = num.toString();
  }, 1000)!;
});

OstoptBtn.addEventListener("click", () => {
  // 停止计时
  clearTimer();
});

let num2: number = 0;
let clearTimer2: () => void;
OstartBtn2.addEventListener("click", () => {
  // 开始计时
  clearTimer2 = startTimerOut(() => {
    num2 += 100;
    Onumber2.innerHTML = num2.toString();
  }, 3000)!;
});

OstoptBtn2.addEventListener("click", () => {
  // 停止计时
  clearTimer2();
});
