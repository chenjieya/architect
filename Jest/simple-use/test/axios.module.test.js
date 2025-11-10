const userData = require('./users.json')
const axios = require('axios')
const User = require('../api/useApi')


// jest.mock('axios')

// test("模拟第三方模块axios", async () => {
//   const res = {
//     data: userData
//   }

//   axios.get.mockImplementation(() => Promise.resolve(res))

//   expect(User.all()).resolves.toEqual(userData)
// })


jest.mock("axios", () => {
  const userData = require('./users.json')
  return {
    get: jest.fn(() => Promise.resolve({data: userData}))
  }
})

test("模拟第三方模块axios", async () => {
  expect(User.all()).resolves.toEqual(userData)
})