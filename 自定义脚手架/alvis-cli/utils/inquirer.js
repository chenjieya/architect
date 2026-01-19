import { select, confirm, input } from "@inquirer/prompts";

export async function inquirerChoose(message, choices) {
  return await select({
    message,
    choices
  });
}

export async function inquirerConfirm(message) {
  return await confirm({
    message,
    default: "y"
  });
}

export async function inquirerInput(message, validate) {
  return await input({
    message,
    validate
  });
}
