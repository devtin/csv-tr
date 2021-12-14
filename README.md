# csv-tr

Utility to transform csv files

## Manifesto

Transforming long csv files using graphic user interfaces may not be the most efficient at times. I wanted a utility to
help me transform long csv files. This utility should:

- [Filter rows using JS expression](#filtering-rows)
- [Transform rows using JS expression](#transforming-rows)
- [Sort rows by multiple header names](#sorting-rows-by-header)
- [Select columns](#including-only-certain-headers)
- [Sort columns](#including-only-certain-headers)

## CLI usage

```text
Usage: csv-tr [options] [source | input stream]

transforms given csv file or stream and outputs the result

Options:
  -V, --version                      output the version number
  -o, --only <headers>               Output only specified headers (separated by comma). Not to be used with --exclude.
  -e, --exclude <headers>            Exclude specified headers (comma separated). Not to be used with --only.
  -t, --transform <js-expression>  JS expression to transform each <row>. Ej: -t "row.email = row.email.toLowerCase()"
  -f, --filter <js-expression>       JS expression to filter each <row>. Ej: -f "row.state === 'FL'"
  -s, --sort <sort-expression>       Sort entries by header. Ej: -s "firstName:1,lastName:-1"
  -h, --help                         display help for command
```

## Input sample
Imagine a CSV file called `contacts.csv` with content

```csv
name,email,state
Juan,juan@gmail.com,FL
Miguel,miguel@hotmail.com,NY
Jesus,jesus@gmail.com,NY
```

### Filtering rows

Each `row` is nothing but a row of the csv file represented as a JSON object streamed by
<a href="https://github.com/mafintosh/csv-parser" target="_blank">csv-parser</a>.

The `index` value is given row number starting at `0`. Meaning `index` of the first row (which is not the header)
equals `0`. 

Filtering values using the option `--filter` or `-f` followed by a JavaScript expression that will be evaluated
against a function that looks like `(row, index) => { return /* your JavaScript expression */ }` and should return
boolean.

```shell
csv-tr contacts.csv -f "/@gmail.com$/i.test(row.email)" > gmail-contacts.csv
```

`gmail-contacts.csv` would look like:

```csv
name,email,state
Juan,juan@gmail.com,FL
Jesus,jesus@gmail.com,NY
```

**Slicing a given range of rows using the `index` value**

```shell
csv-tr contacts.csv -f "index > 0 && index < 2" > gmail-contacts.csv
```

Would display:

```csv
name,email,state
Miguel,miguel@hotmail.com,NY
```

### Transforming rows

Transforming values using the option `--transform` or `-t` followed by a JavaScript expression that will be evaluated
against a function that looks like `(row, index) => { /* your js expression */ }`. Just transform the keys (columns) of
the `row` object.

Using the same `contacts.csv` [input sample](#input-sample).

```shell
csv-tr contacts.csv -t "row.name = row.name.toUpperCase(); row.email = row.email.toUpperCase(); row.initial = row.name[0]" > contacts-uppercase.csv
```

`contacts-uppercase.csv` would look like:

```csv
name,email,state,initial
JUAN,JUAN@GMAIL.COM,FL,J
MIGUEL,MIGUEL@HOTMAIL.COM,NY,M
JESUS,JESUS@GMAIL.COM,NY,J
```

### Including only certain columns 

Using the same `contacts.csv` [input sample](#input-sample).

```shell
csv-tr contacts.csv -o email,state > contact-email-state.csv
```

`contacts-uppercase.csv` would look like:

```csv
email,state
juan@gmail.com,FL
miguel@hotmail.com,NY
jesus@gmail.com,NY
```

### Excluding certain columns

Using the same `contacts.csv` [input sample](#input-sample).

```shell
csv-tr contacts.csv -e email,state > contact-names.csv
```

`contacts-uppercase.csv` would look like:

```csv
name
Juan
Miguel
Jesus
```

### Sorting entries by header

Using the same `contacts.csv` [input sample](#input-sample), imagine sorting by `state` -> `DESC` and `name` -> `ASC`:

```shell
csv-tr contacts.csv -s state:-1,name:1 > contacts-sort.csv
```
Would output:

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
  // filter: (row) => { return /@gmail.com$/i.test(row.email) },
  // transform: (row) => { row.name = row.name.toUpperCase(); row.email = row.email.toUpperCase(); return row },
  // only: ['email', 'state],
  // exclude: ['email', 'state],
}).pipe(csvStringify()).pipe(fs.createWriteStream('result.csv'))

// SORTING
// mind sorting buffers all rows
const csvStreamToSort = csvTr(fs.createReadStream('contacts.csv'))

sort(csvStreamToSort, { state: -1, name: 1 }).then(sortedStream => {
  sortedStream.pipe(csvStringify()).pipe(fs.createWriteStream('result-sorted.csv'))
})
```

`result-sorted.csv` would look like:

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
