const fs = require('fs')
const { Transform } = require('stream')
const csv = require('csv-parser')
const R = require('ramda')

const getEntry = ($, { only, exclude } = {}) => {
  if (only && only.length > 0) {
    return R.pick(only, $)
  }

  if (exclude && exclude.length > 0) {
    return R.omit(exclude, $)
  }

  return $
}

const csvTr = (streamOrFile, { transform = R.identity(), filter = R.always(true), only, exclude } = {}) => {
  const stream = typeof streamOrFile === 'object' ? streamOrFile : fs.createReadStream(streamOrFile)
  let index = -1
  const customTransformer = new Transform({
    objectMode: true,
    transform ($, encoding, callback) {
      index++
      try {
        if (!filter($, index)) {
          return callback()
        }
      } catch (error) {
        return callback(error)
      }

      try {
        const output = getEntry(transform(getEntry($, { exclude }), index), { only })
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
