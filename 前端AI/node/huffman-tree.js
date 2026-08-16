/**
 * 哈夫曼树 JavaScript 实现
 * 包含节点类、树构建、编码和解码功能
 */

// 哈夫曼树节点类
class HuffmanNode {
  constructor(char = null, frequency = 0, left = null, right = null) {
    this.char = char; // 字符（叶子节点才有值）
    this.frequency = frequency; // 频率/权重
    this.left = left; // 左子节点
    this.right = right; // 右子节点
  }

  // 判断是否为叶子节点
  isLeaf() {
    return this.left === null && this.right === null;
  }
}

// 最小堆类（用于构建哈夫曼树）
class MinHeap {
  constructor() {
    this.heap = [];
  }

  // 获取父节点索引
  getParentIndex(index) {
    return Math.floor((index - 1) / 2);
  }

  // 获取左子节点索引
  getLeftChildIndex(index) {
    return 2 * index + 1;
  }

  // 获取右子节点索引
  getRightChildIndex(index) {
    return 2 * index + 2;
  }

  // 交换两个节点
  swap(index1, index2) {
    [this.heap[index1], this.heap[index2]] = [
      this.heap[index2],
      this.heap[index1]
    ];
  }

  // 向上调整堆
  heapifyUp(index) {
    if (index === 0) return;

    const parentIndex = this.getParentIndex(index);
    if (this.heap[parentIndex].frequency > this.heap[index].frequency) {
      this.swap(parentIndex, index);
      this.heapifyUp(parentIndex);
    }
  }

  // 向下调整堆
  heapifyDown(index) {
    const leftChildIndex = this.getLeftChildIndex(index);
    const rightChildIndex = this.getRightChildIndex(index);
    let smallest = index;

    if (
      leftChildIndex < this.heap.length &&
      this.heap[leftChildIndex].frequency < this.heap[smallest].frequency
    ) {
      smallest = leftChildIndex;
    }

    if (
      rightChildIndex < this.heap.length &&
      this.heap[rightChildIndex].frequency < this.heap[smallest].frequency
    ) {
      smallest = rightChildIndex;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  // 插入节点
  insert(node) {
    this.heap.push(node);
    this.heapifyUp(this.heap.length - 1);
  }

  // 提取最小值
  extractMin() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();

    const min = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.heapifyDown(0);
    return min;
  }

  // 获取堆大小
  size() {
    return this.heap.length;
  }
}

// 哈夫曼树类
class HuffmanTree {
  constructor() {
    this.root = null;
    this.codes = new Map(); // 存储字符到编码的映射
  }

  // 统计字符频率
  getFrequencyMap(text) {
    const frequencyMap = new Map();
    for (const char of text) {
      frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
    }
    return frequencyMap;
  }

  // 构建哈夫曼树
  buildTree(text) {
    if (!text || text.length === 0) {
      throw new Error("输入文本不能为空");
    }

    // 统计字符频率
    const frequencyMap = this.getFrequencyMap(text);

    // 如果只有一个字符，创建特殊处理
    if (frequencyMap.size === 1) {
      const char = frequencyMap.keys().next().value;
      this.root = new HuffmanNode(char, frequencyMap.get(char));
      this.codes.set(char, "0");
      return;
    }

    // 创建最小堆
    const minHeap = new MinHeap();

    // 将所有字符作为叶子节点加入堆
    for (const [char, frequency] of frequencyMap) {
      minHeap.insert(new HuffmanNode(char, frequency));
    }

    // 构建哈夫曼树
    while (minHeap.size() > 1) {
      // 取出频率最小的两个节点
      const left = minHeap.extractMin();
      const right = minHeap.extractMin();

      // 创建新的内部节点
      const merged = new HuffmanNode(
        null,
        left.frequency + right.frequency,
        left,
        right
      );

      // 将新节点加入堆
      minHeap.insert(merged);
    }

    // 堆中最后一个节点就是根节点
    this.root = minHeap.extractMin();

    // 生成编码表
    this.generateCodes();
  }

  // 生成编码表
  generateCodes() {
    this.codes.clear();
    if (this.root) {
      this.generateCodesHelper(this.root, "");
    }
  }

  // 递归生成编码
  generateCodesHelper(node, code) {
    if (node.isLeaf()) {
      // 叶子节点，存储编码
      this.codes.set(node.char, code || "0");
    } else {
      // 内部节点，继续递归
      if (node.left) {
        this.generateCodesHelper(node.left, code + "0");
      }
      if (node.right) {
        this.generateCodesHelper(node.right, code + "1");
      }
    }
  }

  // 编码文本
  encode(text) {
    if (!this.root) {
      throw new Error("请先构建哈夫曼树");
    }

    let encoded = "";
    for (const char of text) {
      if (!this.codes.has(char)) {
        throw new Error(`字符 '${char}' 不在编码表中`);
      }
      encoded += this.codes.get(char);
    }
    return encoded;
  }

  // 解码文本
  decode(encodedText) {
    if (!this.root) {
      throw new Error("请先构建哈夫曼树");
    }

    let decoded = "";
    let currentNode = this.root;

    // 特殊情况：只有一个字符的树
    if (this.root.isLeaf()) {
      return this.root.char.repeat(encodedText.length);
    }

    for (const bit of encodedText) {
      if (bit === "0") {
        currentNode = currentNode.left;
      } else if (bit === "1") {
        currentNode = currentNode.right;
      } else {
        throw new Error(`无效的编码位: ${bit}`);
      }

      // 如果到达叶子节点，记录字符并重置到根节点
      if (currentNode && currentNode.isLeaf()) {
        decoded += currentNode.char;
        currentNode = this.root;
      }
    }

    return decoded;
  }

  // 获取编码表
  getCodes() {
    return new Map(this.codes);
  }

  // 打印编码表
  printCodes() {
    console.log("哈夫曼编码表:");
    console.log("字符\t频率\t编码");
    console.log("-------------------");

    const sortedCodes = Array.from(this.codes.entries()).sort(
      (a, b) => a[1].length - b[1].length
    );
    for (const [char, code] of sortedCodes) {
      console.log(`'${char}'\t\t${code}`);
    }
  }

  // 计算压缩率
  calculateCompressionRatio(originalText, encodedText) {
    const originalBits = originalText.length * 8; // 假设每个字符8位
    const compressedBits = encodedText.length;
    const compressionRatio = (
      ((originalBits - compressedBits) / originalBits) *
      100
    ).toFixed(2);
    return compressionRatio;
  }

  // 可视化树结构（简单的文本表示）
  printTree() {
    if (!this.root) {
      console.log("树为空");
      return;
    }
    console.log("哈夫曼树结构:");
    this.printTreeHelper(this.root, "", true);
  }

  printTreeHelper(node, prefix, isLast) {
    if (!node) return;

    const nodeLabel = node.isLeaf()
      ? `'${node.char}'(${node.frequency})`
      : `*(${node.frequency})`;
    console.log(prefix + (isLast ? "└── " : "├── ") + nodeLabel);

    const newPrefix = prefix + (isLast ? "    " : "│   ");

    if (node.left) {
      this.printTreeHelper(node.left, newPrefix, !node.right);
    }
    if (node.right) {
      this.printTreeHelper(node.right, newPrefix, true);
    }
  }
}

// 测试和演示函数
function demonstrateHuffmanTree() {
  console.log("=== 哈夫曼树演示 ===\n");

  // 测试用例1：简单文本
  console.log("测试用例1: 简单文本");
  const text1 = "hello world";
  console.log(`原始文本: "${text1}"`);

  const huffman1 = new HuffmanTree();
  huffman1.buildTree(text1);

  huffman1.printCodes();
  console.log();

  const encoded1 = huffman1.encode(text1);
  console.log(`编码结果: ${encoded1}`);

  const decoded1 = huffman1.decode(encoded1);
  console.log(`解码结果: "${decoded1}"`);

  const compressionRatio1 = huffman1.calculateCompressionRatio(text1, encoded1);
  console.log(`压缩率: ${compressionRatio1}%`);
  console.log();

  // 测试用例2：重复字符较多的文本
  console.log("测试用例2: 重复字符较多的文本");
  const text2 = "aaaaabbbbcccdde";
  console.log(`原始文本: "${text2}"`);

  const huffman2 = new HuffmanTree();
  huffman2.buildTree(text2);

  huffman2.printCodes();
  console.log();

  const encoded2 = huffman2.encode(text2);
  console.log(`编码结果: ${encoded2}`);

  const decoded2 = huffman2.decode(encoded2);
  console.log(`解码结果: "${decoded2}"`);

  const compressionRatio2 = huffman2.calculateCompressionRatio(text2, encoded2);
  console.log(`压缩率: ${compressionRatio2}%`);
  console.log();

  // 测试用例3：单个字符
  console.log("测试用例3: 单个字符");
  const text3 = "aaaaa";
  console.log(`原始文本: "${text3}"`);

  const huffman3 = new HuffmanTree();
  huffman3.buildTree(text3);

  huffman3.printCodes();
  console.log();

  const encoded3 = huffman3.encode(text3);
  console.log(`编码结果: ${encoded3}`);

  const decoded3 = huffman3.decode(encoded3);
  console.log(`解码结果: "${decoded3}"`);
  console.log();

  // 测试用例4：中文文本
  console.log("测试用例4: 中文文本");
  const text4 = "你好世界";
  console.log(`原始文本: "${text4}"`);

  const huffman4 = new HuffmanTree();
  huffman4.buildTree(text4);

  huffman4.printCodes();
  console.log();

  const encoded4 = huffman4.encode(text4);
  console.log(`编码结果: ${encoded4}`);

  const decoded4 = huffman4.decode(encoded4);
  console.log(`解码结果: "${decoded4}"`);
  console.log();

  // 显示树结构
  console.log("树结构可视化:");
  huffman2.printTree();
}

// 性能测试函数
function performanceTest() {
  console.log("\n=== 性能测试 ===");

  // 生成测试数据
  const testTexts = [
    "a".repeat(1000) + "b".repeat(500) + "c".repeat(250) + "d".repeat(125),
    "hello world ".repeat(100),
    "abcdefghijklmnopqrstuvwxyz".repeat(50)
  ];

  for (let i = 0; i < testTexts.length; i++) {
    const text = testTexts[i];
    console.log(`\n测试文本 ${i + 1} (长度: ${text.length}):`);

    const start = performance.now();
    const huffman = new HuffmanTree();
    huffman.buildTree(text);
    const encoded = huffman.encode(text);
    const decoded = huffman.decode(encoded);
    const end = performance.now();

    console.log(`处理时间: ${(end - start).toFixed(2)}ms`);
    console.log(`编码长度: ${encoded.length} 位`);
    console.log(`压缩率: ${huffman.calculateCompressionRatio(text, encoded)}%`);
    console.log(`解码正确性: ${text === decoded ? "✓" : "✗"}`);
  }
}

// 运行演示
if (require.main === module) {
  demonstrateHuffmanTree();
  performanceTest();
}

// 导出类供其他模块使用
module.exports = {
  HuffmanNode,
  HuffmanTree,
  MinHeap
};
