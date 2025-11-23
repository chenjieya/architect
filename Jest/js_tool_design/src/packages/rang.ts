// range(1, 6) ---> [1, 2, 3, 4, 5] 左闭右开
// range(1, 6, 2) ---> [1, 3, 5]
// range(1, 6, -2) ---> [1, 3, 5]

// range(6, 1) ---> [6, 5, 4, 3, 2]
// range(6, 1, -2) ---> [6, 4, 2]
// range(6, 1, 2) ---> [6, 4, 2]

export function rang(start?:number, end?: number, step?: number) {

  // 参数校验
  start = start ? (isNaN(+start) ? 0 : +start) : 0
  end = end ? (isNaN(+end) ? 0 : +end) : 0
  step = step ? (isNaN(+step) ? 0 : +step) : 1



  // step逻辑
  if((start > end && step > 0)  ||(start < end && step < 0) ) {
    step = -step
  }


  const arr: number[] = []

  for(let i = start;  start > end ? i > end : i < end; i += step) {
    arr.push(i)
  }

  return arr
}
