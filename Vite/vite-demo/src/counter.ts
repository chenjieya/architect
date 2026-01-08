export function counter(button: HTMLElement) {
  let count = 0;

  const setCount = (num: number) => {
    count = num;
    button.innerHTML = `counter: ${count}`;
  };

  button.addEventListener("click", function () {
    setCount(count + 1);
  });

  setCount(0);
}
