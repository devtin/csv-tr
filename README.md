# csv-tr

Utility to transform csv files

## Manifesto

Transforming long csv files using graphic user interfaces may not be the most efficient at times. I wanted a utility to
help me transform long csv files. This utility should:

- [Filter entries using JS expression](#filtering-entries)
- [Transform entries using JS expression](#transforming-entries)
- [Sorts entries by multiple header names](#sorting-entries-by-header)
- [Select headers](#including-only-certain-headers)

## CLI usage

```text
Usage: csv-tr [options] [source | input stream]

transforms given csv file or stream and outputs the result

Options:
  -V, --version                      output the version number
  -o, --only <headers>               Output only specified headers (separated by comma). Not to be used with --exclude.
  -e, --exclude <headers>            Exclude specified headers (comma separated). Not to be used with --only.
  -t, --transformer <js-expression>  JS expression to transform each <entry>. Ej: -t "entry.email = entry.email.toLowerCase()"
  -f, --filter <js-expression>       JS expression to filter each <entry>. Ej: -f "entry.state === 'FL'"
  -s, --sort <sort-expression>       Sort entries by header. Ej: -s "firstName:1,lastName:-1"
  -h, --help                         display help for command
```

Imagine a CSV file called `contacts.csv` with content

```csv
name,email,state
Juan,juan@gmail.com,FL
Miguel,miguel@hotmail.com,NY
Jesus,jesus@gmail.com,NY
```

### Filtering entries

Filtering only gmail contacts:

```shell
csv-tr contacts.csv -f "/@gmail.com$/i.test(entry.email)" > gmail-contacts.csv
```

`gmail-contacts.csv` will look like:

```csv
name,email,state
Juan,juan@gmail.com,FL
Jesus,jesus@gmail.com,NY
```

### Transforming entries

Transforming values

```shell
csv-tr contacts.csv -t "entry.name = entry.name.toUpperCase(); entry.email = entry.email.toUpperCase(); entry.initial = entry.name[0]" > contacts-uppercase.csv
```

`contacts-uppercase.csv` will look like:

```csv
name,email,state,initial
JUAN,JUAN@GMAIL.COM,FL,J
MIGUEL,MIGUEL@HOTMAIL.COM,NY,M
JESUS,JESUS@GMAIL.COM,NY,J
```

### Including only certain headers 

Including only certain columns

```shell
csv-tr contacts.csv -o email,state > contact-email-state.csv
```

`contacts-uppercase.csv` will look like:

```csv
email,state
juan@gmail.com,FL
miguel@hotmail.com,NY
jesus@gmail.com,NY
```

### Excluding certain headers

Excluding certain columns

```shell
csv-tr contacts.csv -e email,state > contact-names.csv
```

`contacts-uppercase.csv` will look like:

```csv
name
Juan
Miguel
Jesus
```

### Sorting entries by header

Sorting by `state` -> `DESC` and `name` -> `ASC`:

```shell
csv-tr contacts.csv -s state:-1,name:1 > contacts-sort.csv
```
 Will output:

```csv
name,email,state
Jesus,jesus@gmail.com,NY
Miguel,miguel@hotmail.com,NY
Juan,juan@gmail.com,FL
```

## API Usage

Using all above's examples at once.

```js
const fs = require('fs');
const { csvTr, sort, csvStringify } = require('csv-tr');

csvTr(fs.createReadStream('contacts.csv'), {
  // filter: (entry) => { return /@gmail.com$/i.test(entry.email) },
  // transformer: (entry) => { entry.name = entry.name.toUpperCase(); entry.email = entry.email.toUpperCase(); return entry },
  // only: ['email', 'state],
  // exclude: ['email', 'state],
}).pipe(csvStringify()).pipe(fs.createWriteStream('result.csv'))

// SORTING
// mind sorting buffers all entries
const csvStreamToSort = csvTr(fs.createReadStream('contacts.csv'))

sort(csvStreamToSort, { state: -1, name: 1 }).then(sortedStream => {
  sortedStream.pipe(csvStringify()).pipe(fs.createWriteStream('result-sorted.csv'))
})
```

`result-sorted.csv` will look like:

```csv
name,email,state
Jesus,jesus@gmail.com,NY
Miguel,miguel@hotmail.com,NY
Juan,juan@gmail.com,FL
```

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2021 Martin Rafael <tin@devtin.io>
