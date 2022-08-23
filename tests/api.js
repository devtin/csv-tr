const fs = require('fs')
const { csvTr, sort, csvStringify } = require('../')

csvTr(fs.createReadStream('contacts.csv'), {
  // filter: (row, index) => { return /@gmail.com$/i.test(row.email) },
  // transform: (row, index) => { row.name = row.name.toUpperCase(); row.email = row.email.toUpperCase(); return row },
  // only: ['email', 'state],
  // exclude: ['email', 'state],
}).pipe(csvStringify()).pipe(fs.createWriteStream('result.csv'))

// SORTING
// mind sorting buffers all rows
const csvStreamToSort = csvTr(fs.createReadStream('contacts.csv'))

sort(csvStreamToSort, { state: -1, name: 1 }).then(sortedStream => {
  sortedStream.pipe(csvStringify()).pipe(fs.createWriteStream('result-sorted.csv'))
})
