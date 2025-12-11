const crypto = require("crypto");
function sign(info, secret) {
  return crypto.createHmac("sha256", secret).update(info).digest("hex");
}
console.log(sign("hello1", "world"));
