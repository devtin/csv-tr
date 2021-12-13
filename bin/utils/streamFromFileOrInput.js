const fs = require('fs')
const { fromCwd } = require('./fromCwd')

const streamFromFileOrInput = (givenFile) => {
  if (givenFile) {
    return fs.createReadStream(fromCwd(givenFile))
  }

  if (process.stdin.isTTY) {
    throw new Error('a source must be provided')
  }

  return process.stdin
}

module.exports = {
  streamFromFileOrInput
}
