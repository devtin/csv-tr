const path = require('path')

const fromCwd = (...paths) => {
  return path.resolve(process.cwd(), ...paths)
}

module.exports = {
  fromCwd
}
