/**
 * 判断元素是否位于窗口上半部分
 */
export function isDomOnWinTop(x: number, y: number): boolean {
  // 获取浏览器可视区域的宽度和高度
  // const viewportWidth: number = window.innerWidth || document.documentElement.clientWidth;
  const viewportHeight: number = window.innerHeight || document.documentElement.clientHeight

  if (y <= viewportHeight / 2) {
    return true
  }

  return false
}

/**手动出发第一行的点击事件 */
export const triggerClick = (select: string) => {
  nextTick(() => {
    const dom = document.querySelectorAll(select)[0]
    if (dom) {
      const event = new MouseEvent('click', { bubbles: true })
      dom.dispatchEvent(event)
    }
  })
}
