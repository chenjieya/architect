const readline = require("readline-sync");
const { randomNum, isRepeat } = require("./utils");

/**
 * 主函数
 */
function main() {
  console.log("欢迎来到猜数字游戏！");
  // guessNum 代表用户猜测的数字
  let a = 0,
    b = 0,
    chance = 10,
    guessNum: string;

  const computerNum: number[] = randomNum();

  // 鼓励语句
  const arr: string[] = [
    "加油！",
    "还差一点了",
    "你马上就要猜中了",
    "很简单的，再想想",
    "也许你需要冷静一下"
  ];

  while (chance) {
    console.log("请输入你要猜测的数字：");
    guessNum = readline.question("");
    if (guessNum.length !== 4) {
      console.log("长度必须为4");
    } else if (isNaN(Number(guessNum))) {
      console.log("输入的数字有问题");
    } else {
      // 符合要求，进行一个判断
      // 判断是否重复 需要将字符串转换为数组
      let guessNum2: string[] = [...guessNum];
      if (!isRepeat(guessNum2)) {
        // 如果能够进入到此 if 说明玩家输入的数字是OK的 可以开始进行判断
        for (let i = 0; i < guessNum2.length; i++) {
          for (let j = 0; j < computerNum.length; j++) {
            if (guessNum2[i] == computerNum[j]!.toString()) {
              // 如果能够进入到此 if 说明数字相同
              if (i === j) {
                // 如果进入此 if  说明 位置也相同
                a++;
              } else {
                b++;
              }
            }
          }
        }
        if (a === 4) {
          // 如果进入此 if 说明玩家全部猜对了 跳出while
          break;
        } else {
          console.log(`${a}A${b}B`);
          chance--;
          if (chance !== 0) {
            let index = Math.floor(Math.random() * arr.length);
            console.log(`你还剩下${chance}次机会,${arr[index]}`);
          }
          a = b = 0; // 清空 a 和 b 的值
        }
      } else {
        console.log("你输入的数字重复了, 请重新输入!");
      }
    }
  }
  // 如果跳出了上面的while 说明游戏结束了 但是 分为 2 种情况
  // 1. 提前猜对了   2. 机会用完了
  if (chance === 0) {
    // 进入此 if 说明是机会用完了
    console.log("很遗憾,你已经没有机会了！");
    console.log(`电脑生成的随机数为${computerNum}`);
  } else {
    console.log("恭喜你,猜测正确,游戏结束");
    console.log("Thank you for playing");
  }
}

main();
