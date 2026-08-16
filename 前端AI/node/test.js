// 基础版本的冒泡排序
function bubbleSort(arr) {
  const n = arr.length;

  // 外层循环控制排序轮数
  for (let i = 0; i < n - 1; i++) {
    // 内层循环进行相邻元素比较和交换
    for (let j = 0; j < n - 1 - i; j++) {
      // 如果前一个元素大于后一个元素，则交换位置
      if (arr[j] > arr[j + 1]) {
        // 交换元素
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }

  return arr;
}

// 优化版本的冒泡排序（添加了提前终止机制）
function bubbleSortOptimized(arr) {
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let swapped = false; // 标记本轮是否发生了交换

    for (let j = 0; j < n - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }

    // 如果本轮没有发生交换，说明数组已经有序，可以提前结束
    if (!swapped) {
      break;
    }
  }

  return arr;
}

// 测试代码
const testArray1 = [64, 34, 25, 12, 22, 11, 90];
const testArray2 = [5, 2, 8, 1, 9];
const testArray3 = [1, 2, 3, 4, 5]; // 已经有序的数组

console.log("原始数组1:", testArray1);
console.log("基础冒泡排序结果:", bubbleSort([...testArray1]));

console.log("\n原始数组2:", testArray2);
console.log("优化冒泡排序结果:", bubbleSortOptimized([...testArray2]));

console.log("\n原始数组3 (已有序):", testArray3);
console.log("优化冒泡排序结果:", bubbleSortOptimized([...testArray3]));

// 性能测试
function performanceTest() {
  const largeArray = Array.from({ length: 1000 }, () =>
    Math.floor(Math.random() * 1000)
  );

  console.log("\n=== 性能测试 ===");

  // 测试基础版本
  const start1 = performance.now();
  bubbleSort([...largeArray]);
  const end1 = performance.now();
  console.log(`基础冒泡排序耗时: ${(end1 - start1).toFixed(2)}ms`);

  // 测试优化版本
  const start2 = performance.now();
  bubbleSortOptimized([...largeArray]);
  const end2 = performance.now();
  console.log(`优化冒泡排序耗时: ${(end2 - start2).toFixed(2)}ms`);
}

performanceTest();
