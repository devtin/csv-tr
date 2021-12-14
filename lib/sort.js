const { Readable } = require('stream')
const R = require('ramda')

const sortArray = (arr, sort) => {
  const toIndex = (value) => {
    if (typeof value === 'boolean') {
      return value ? 1 : -1
    }
    return value
  }
  const calcIndex = (a, b, factor = 1) => {
    if (a === b) {
      return 0
    }

    if (typeof a === 'string' && typeof b === 'string') {
      return toIndex(a > b) * factor
    }
    const A = toIndex(a)
    const B = toIndex(b)

    return (A - B) * factor
  }

  Object.keys(sort).reverse().forEach(prop => {
    arr = arr.sort((a, b) => {
      return calcIndex(R.prop(prop, a), R.prop(prop, b), toIndex(R.prop(prop, sort)))
    })
  })
  return arr
}

const grabEntriesFromStream = (stream) => {
  const listOfEntries = []

  return new Promise((resolve, reject) => {
    stream.on('end', () => {
      resolve(listOfEntries)
    })

    stream.on('error', reject)

    stream.on('data', (row) => {
      listOfEntries.push(row)
    })
  })
}

// split into chunks for fast processing
const sort = async (stream, sort) => {
  const entries = await grabEntriesFromStream(stream)

  return Readable.from(sortArray(entries, sort))
}

module.exports = {
  sort
}
