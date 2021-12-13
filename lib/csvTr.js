const fs = require('fs')
const { Transform } = require('stream')
const csv = require('csv-parser')
const R = require('ramda')

const getEntry = (entry, { only, exclude } = {}) => {
  if (only && only.length > 0) {
    return R.pick(only, entry)
  }

  if (exclude && exclude.length > 0) {
    return R.omit(exclude, entry)
  }

  return entry
}

const csvTr = (streamOrFile, { transformer = R.identity(), filter = R.always(true), only, exclude } = {}) => {
  const stream = typeof streamOrFile === 'object' ? streamOrFile : fs.createReadStream(streamOrFile)
  let index = 0
  const customTransformer = new Transform({
    objectMode: true,
    transform (entry, encoding, callback) {
      index++
      try {
        if (!filter(entry, index)) {
          return callback()
        }
      } catch (error) {
        return callback(error)
      }

      try {
        const output = getEntry(transformer(getEntry(entry, { exclude })), { only })
        callback(null, output)
      } catch (error) {
        callback(error)
      }
    }
  })

  return stream.pipe(csv()).pipe(customTransformer)
}

module.exports = {
  csvTr
}
