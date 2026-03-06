import { config } from "../config";
import { layzeReport } from "../report";
import { getPaths } from "../utils/paths";
export function tracker(event) {
  // 如果是全埋点，则不用手动上报
  if (config.isTrackAll) return;

  const target = event.target;

  const data = {
    eventType: event.type,
    tagName: target.tagName,
    x: event.x,
    y: event.y,
    paths: getPaths(event),
    value: target.value || target.innerText
  };

  // 添加到上报队列
  layzeReport("action", data);
}

// 全部埋点上报 和 属性上报
export function autoTracker() {
  ["click", "keydown", "blur", "focus", "touchstart", "touchend"].forEach(
    (eventType) => {
      let timer = null;
      document.addEventListener(
        eventType,
        (event) => {
          clearTimeout(timer);
          timer = setTimeout(() => {
            const target = event.target;
            const dataTracker = target.getAttribute("data-tracker");

            //如果配置项中config.trackerAll为true，则所有元素都需要上报
            //如果元素上有data-tracker属性，则上报
            if (config.isTrackAll || dataTracker) {
              const data = {
                eventType: event.type,
                tagName: target.tagName || "window",
                x: event.x,
                y: event.y,
                paths: getPaths(event),
                value: target.value || target.innerText || ""
              };
              layzeReport("action", data);
            }
          }, 500);
        },
        false
      );
    }
  );
}
