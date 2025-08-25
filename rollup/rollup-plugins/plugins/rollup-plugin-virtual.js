const virtualModuleId = "virtual-module";

// 按照习惯给他换个名字
const resolvedVirtualModuleId = "\0" + virtualModuleId;

export default function virtual(options = {}) {
  return {
    name: "virtual-example",
    resolveId(source) {
      if(source === virtualModuleId) {
        return resolvedVirtualModuleId
      }
      return null
    },
    load(id) {
      if(id === resolvedVirtualModuleId) {
        return `export default "This is example;"`
      }
      return null
    }
  };
}
