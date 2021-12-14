const { Transform } = require('stream')

const stringify = (value) => {
  return /[,"]/.test(value) ? JSON.stringify(value) : value
}

const csvStringify = () => {
  let columnSent = false

  const rowToCsvLine = (row) => {
    const columns = []

    const values = Object.entries(row).map(([column, value]) => {
      columns.push(column)
      return stringify(value)
    }).join(',') + '\n'

    if (!columnSent) {
      columnSent = true
      return columns.map(columnName => stringify(columnName)) + '\n' + values
    }

    return values
  }

  return new Transform({
    objectMode: true,
    transform (row, encoding, callback) {
      callback(null, rowToCsvLine(row))
    }
  })
}

module.exports = {
  csvStringify
}
