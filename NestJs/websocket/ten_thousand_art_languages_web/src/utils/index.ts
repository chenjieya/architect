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
export const triggerClick = (select: string, num: number) => {
  nextTick(() => {
    const dom = document.querySelectorAll(select)[num]
    if (dom) {
      const event = new MouseEvent('click', { bubbles: true })
      dom.dispatchEvent(event)
    }
  })
}

/**
 * 时间格式化
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time: string | number, cFormat: string) {
  if (!time) {
    return null
  }
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
      time = parseInt(time)
    }
    if (typeof time === 'number' && time.toString().length === 10) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key as keyof typeof formatObj]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return time_str
}
