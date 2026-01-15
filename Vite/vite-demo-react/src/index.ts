import { counter } from "./counter.ts";

document.querySelector("#app")!.innerHTML = `
	<div>
		<button id='btn'></button>
	</div>
`;

counter(document.querySelector("#btn") as HTMLElement);
