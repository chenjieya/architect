type FuncType = (...args: any[]) => any

export function debounce<T extends FuncType>(func: T, wait: number = 300) {

  let timer: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {

    if(timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      func(...args)
    }, wait);

  }
}