/**
 * 判断数组里面的数字是否重复
 * @param arr
 */
function isRepeat(arr: (string | number)[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) {
        // 说明有数字重复
        return true;
      }
    }
  }
  return false;
}

/**
 * 生成0～9随机数 整数
 */
function randomNum(): number[] {
  while (true) {
    const computerNum: number[] = [];
    for (let i = 0; i < 4; i++) {
      computerNum.push(Math.floor(Math.random() * 10));
    }

    // if (new Set(computerNum).size === 4) {
    //   return computerNum;
    // }
    if (!isRepeat(computerNum)) {
      return computerNum;
    }
  }
}

module.exports = {
  randomNum,
  isRepeat
};
