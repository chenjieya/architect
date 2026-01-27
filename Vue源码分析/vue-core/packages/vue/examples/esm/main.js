import { reactive } from '@alvis/reactivity'

const obj = {
  a: 1,
  b: 2,
  c: {
    d: 3,
  },
}

const test1 = reactive(obj)
test1.c.d
