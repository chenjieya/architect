let lastEventCapture = null;

[
  "click",
  "dblclick",
  "mousedown",
  "mouseup",
  "keydown",
  "keyup",
  "touchstart",
  "touchend",
  "touchmove"
].forEach((eventType) => {
  document.addEventListener(
    eventType,
    (event) => {
      console.log(event, "saljd");
      lastEventCapture = event;
    },
    {
      capture: true, // 捕获阶段
      passive: true // 不阻止默认事件
    }
  );
});

export function getLastEvent() {
  return lastEventCapture;
}
