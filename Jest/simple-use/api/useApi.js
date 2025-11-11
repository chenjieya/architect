const axios = require('axios')

class User{
  static all() {
    return axios.get('/users.json').then(res => res.data)
  }
}

module.exports = User