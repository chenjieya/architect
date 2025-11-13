// 开始计时器
export function startTimer(callback: () => void, time: number = 1000) {
  if (time < 0) return;
  const timerId = setInterval(callback, time);
  return () => clearInterval(timerId);
}

// 开始延时器
export function startTimerOut(callback: () => void, time: number = 1000) {
  if (time < 0) return;
  const timerId = setTimeout(callback, time);
  return () => clearTimeout(timerId);
}
