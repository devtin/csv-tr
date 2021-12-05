const fs = require('fs');
const { csvTr, bubbleSort, csvStringify } = require('../');

csvTr(fs.createReadStream('contacts.csv'), {
  // filter: (entry) => { return /@gmail.com$/i.test(entry.email) },
  // transformer: (entry) => { entry.name = entry.name.toUpperCase(); entry.email = entry.email.toUpperCase(); return entry },
  // only: ['email', 'state],
  // exclude: ['email', 'state],
}).pipe(csvStringify()).pipe(fs.createWriteStream('result.csv'))

// SORTING
// mind sorting buffers all entries
const csvStreamToSort = csvTr(fs.createReadStream('contacts.csv'))

bubbleSort(csvStreamToSort, { state: -1, name: 1 }).then(sortedStream => {
  sortedStream.pipe(csvStringify()).pipe(fs.createWriteStream('result-sorted.csv'))
})
