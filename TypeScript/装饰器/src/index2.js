// 了解装饰器
class TextMessage {
  constructor(text) {
    this.text = text;
  }

  getText() {
    return this.text;
  }
}

// 通过闭包高阶函数
function HTMLDecorator(BaseClass) {
  return class extends BaseClass {
    getText() {
      const msg = super.getText();
      return `<div>${msg}</div>`;
    }
  };
}

// 闭包高阶函数风格 加密
function EncryptDecorator(BaseClass) {
  return class extends BaseClass {
    getText() {
      const msg = super.getText();
      // 倒序加密
      return this.encrypt(msg);
    }
    encrypt(msg) {
      return msg.split("").reverse().join("");
    }
  };
}

let DecoratorClass = HTMLDecorator(TextMessage);
DecoratorClass = EncryptDecorator(DecoratorClass);

const messageInstance = new DecoratorClass("Hello Typescript");

console.log(messageInstance.getText());
