const { Readable } = require('stream')
const R = require('ramda')

const isDate = (possibleDate) => {
  return new Date(possibleDate).toString() !== 'Invalid Date';
}

const isNumber = (possibleNumber) => {
  return !isNaN(Number(possibleNumber))
}

const isString = (possibleString) => {
  return typeof possibleString === 'string' && !isDate(possibleString) && !isNumber(possibleString)
}

const sortArray = (arr, sort) => {
  const toIndex = (value) => {
    if (typeof value === 'boolean') {
      return value ? 1 : -1
    }

    if (isNumber(value)) {
      return Number(value)
    }

    if (isDate(value)) {
      return new Date(value).getTime()
    }

    return value
  }
  const calcIndex = (a, b, factor = 1) => {
    if (a === b) {
      return 0
    }

    if (isString(a) && isString(b)) {
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
