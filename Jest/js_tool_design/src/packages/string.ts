// truncate("1231323423424", 5) ----> 12...
// truncate("12345", 5) ----> 12345
// truncate("1231323423424", 5, '-') ----> 1231-

export function truncate(str?: string, len?: number, omission = "...") {
  // 内部来做参数防御
  str = String(str);
  omission = String(omission);
  len = len ? Math.round(len) : NaN;

  if (isNaN(len)) {
    return "";
  }

  if (str.length > len) {
    // 说明要开始截断
    str = str.slice(0, len - omission.length) + omission;
  }

  return str;
}