import type { Directive } from 'vue'
import { isDomOnWinTop } from '@/utils/index'

let sourceDom: HTMLElement | null = null

// el的拖拽over事件
function dragover(e: DragEvent) {
  e.preventDefault()
}

// el的drop事件，当将元素放到区域内、松手执行
function dragDown(e: DragEvent) {
  if (e.target instanceof HTMLElement && sourceDom) {
    let container: HTMLElement = e.target

    if (!container.classList.contains('drap-container')) {
      // 找到当前元素最外层的元素，带有drap-container类的元素
      container = e.target.parentElement as HTMLElement
      while (!container.classList.contains('drap-container')) {
        container = container.parentElement as HTMLElement
      }
    }

    // 每一个父元素不能超过两个孩子
    if (container.childElementCount >= 2) {
      return
    }

    // 判断是在上半部分插入元素，还是在下半部分插入元素
    if (isDomOnWinTop(e.x, e.y)) {
      container.prepend(sourceDom)
    } else {
      container.appendChild(sourceDom)
    }
    sourceDom = null
  }
}

// el>item 的dragstart事件，当拖拽开始时执行
function dragStart(e: DragEvent) {
  // 当前拖拽的元素
  sourceDom = e.target as HTMLElement
}

const vDrag: Directive = {
  mounted(el) {
    el.addEventListener('dragover', dragover)
    el.addEventListener('dragstart', dragStart)
    el.addEventListener('drop', dragDown)
  },
  beforeUnmount(el) {
    el.removeEventListener('dragover', dragover)
    el.removeEventListener('drop', dragDown)
    el.removeEventListener('dragstart', dragStart)
  }
}

export default vDrag
