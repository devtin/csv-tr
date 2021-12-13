const { Transform } = require('stream')

const stringify = (value) => {
  return /[,"]/.test(value) ? JSON.stringify(value) : value
}

const csvStringify = () => {
  let headerSent = false

  const entryToCsvLine = (entry) => {
    const headers = []

    const values = Object.entries(entry).map(([header, value]) => {
      headers.push(header)
      return stringify(value)
    }).join(',') + '\n'

    if (!headerSent) {
      headerSent = true
      return headers.map(headerName => stringify(headerName)) + '\n' + values
    }

    return values
  }

  return new Transform({
    objectMode: true,
    transform (entry, encoding, callback) {
      callback(null, entryToCsvLine(entry))
    }
  })
}

module.exports = {
  csvStringify
}
