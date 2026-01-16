import { stuff } from "./stuff";
import { util } from "./utils";

stuff();
util("app");

export function testA() {
  console.log("testA");
  return "abc";
}

export function testB() {
  console.log("testBa");
  return "bac";
}
