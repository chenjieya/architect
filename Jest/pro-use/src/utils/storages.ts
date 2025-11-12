const KEY = "my-app-";
export default {
  set(key: string, value: string) {
    localStorage.setItem(KEY + key, value);
  },
  get(key: string) {
    return localStorage.getItem(KEY + key);
  }
};
