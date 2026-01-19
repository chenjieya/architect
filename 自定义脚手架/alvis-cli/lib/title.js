import figlet from "figlet";
import chalk from "chalk";

function gradient(text) {
  const gradientColors = [
    "#FF6B6B",
    "#FF8E6B",
    "#FFB36B",
    "#FFD86B",
    "#EFFF6B",
    "#B8FF6B"
  ];
  return text
    .split("")
    .map((char, i) => {
      const color =
        gradientColors[
          Math.floor((i / text.length) * (gradientColors.length - 1))
        ];
      return chalk.hex(color)(char);
    })
    .join("");
}

export function useTitle(message) {
  const text = figlet.textSync(message);
  console.log(gradient(text));
}
