export function getComposedPathEle(e) {
  if (!e) return [];

  let pathArr = e.path || (e.composedPath && e.composedPath());

  if ((pathArr || []).length) {
    return pathArr;
  }

  // 兼容
  let target = e.target;
  const composedPath = [];

  while (target && target.parentNode) {
    composedPath.push(target);
    target = target.parentNode;
  }

  composedPath.push(document, window);

  return composedPath;
}

export function getComposedPath(e) {
  if (!e) return [];

  const composedPathEle = getComposedPathEle(e);

  const composePath = composedPathEle
    .reverse()
    .slice(2)
    .map((ele) => {
      let selector = ele.tagName.toLowerCase();
      if (ele.id) {
        selector += `#${ele.id}`;
      }

      if (ele.className) {
        if (typeof ele.className === "string") {
          selector += `.${ele.className.split(" ").join(".")}`;
        } else if (typeof ele.className === "object" && ele.className.baseVal) {
          // svg className 是个对象
          selector += `.${ele.className.baseVal.split(" ").join(".")}`;
        }
      }

      return selector;
    });

  return composePath;
}

export function getPaths(e) {
  if (!e) return "";
  const composedPath = getComposedPath(e);
  return composedPath.join(" > ");
}
