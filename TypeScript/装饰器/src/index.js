// 了解装饰器
class TextMessage {
  constructor(text) {
    this.text = text;
  }

  getText() {
    return this.text;
  }
}

// 装饰器基类
class MessageDecorator {
  constructor(message) {
    console.log("123");
    this.message = message;
  }

  getText() {
    return this.message.getText();
  }
}

// html
class HtmlMessageDecorator extends MessageDecorator {
  getText() {
    return `<div>${super.getText()}</div>`;
  }
}

// 加密
class EncryptedMessageDecorator extends MessageDecorator {
  getText() {
    return `${super.getText()}`.split("").reverse().join("");
  }
}

let message = new TextMessage("hello world");
message = new HtmlMessageDecorator(message);
message = new EncryptedMessageDecorator(message);

console.log(message.getText());
