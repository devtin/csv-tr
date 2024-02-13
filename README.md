# csv-tr

<p>
    <a href="https://www.npmjs.com/package/csv-tr" target="_blank"><img src="https://img.shields.io/npm/v/csv-tr.svg" alt="Version"></a>
<a href="http://opensource.org/licenses" target="_blank"><img src="http://img.shields.io/badge/License-MIT-brightgreen.svg"></a>
</p>


Utility to manipulate long csv files

## Manifesto

Manipulating long csv files using graphic user interfaces might not be the most efficient at times. I want an utility that
helps me manipulate long csv files. This utility should:

- [Filter rows](#filtering-rows)
- [Transform rows](#transforming-rows)
- [Select specific columns](#selecting-specific-columns)
- [Exclude specific columns](#excluding-specific-columns)
- [Sort by columns](#sorting-by-column)

**Glossary of terms**

- **Column**: header column name of a csv file
- **Index**: line number of a csv file
- **Row**: line of a csv file

## Installation

```shell
npm install --global csv-tr
```

using `yarn`

```shell
yarn add global csv-tr
```

using `npx`

```shell
npx csv-tr --help
```

## CLI usage

```text
Usage: csv-tr [options] [source | input stream]

transforms given csv file or stream and outputs the result

Options:
  -V, --version                                             output the version number
  -o, --only <columns>                                      output only specified columns (comma separated). Not to be used with --exclude.
  -e, --exclude <columns>                                   exclude specified columns (comma separated). Not to be used with --only.
  -t, --transform <js-file|js-expression>                   transform rows by given JavaScript expression. Ej: -t "{ email: $.email.toLowerCase() }"
  -f, --filter <js-file|js-expression>                      filter rows by given JavaScript file or expression. Ej: -f "$.state === 'FL'"
  -s, --sort <[sort-column]:[sort-order: 1=ASC | -1=DESC]>  sorts rows by column:order (comma separated) Ej: -s "firstName:1,lastName:-1"
  -h, --help                                                display help for command
```

### Input sample
Imagine a CSV file called `contacts.csv` with content

```csv
name,email,state
Juan,juan@gmail.com,FL
Miguel,miguel@hotmail.com,NY
Jesus,jesus@gmail.com,NY
```

### Filtering rows

Filtering values using the option `--filter` or `-f` followed by a JavaScript expression that will be evaluated
against a function that must return boolean, and looks like:

```js
($, index) => { return /* your JavaScript expression */ }
```

Alternatively a file that exports a function with the same signature is also accepted:

```js
// my-filter-file
module.exports = ($/* , index */) => {
  return /@gmail.com$/i.test($.email)
}
```

Each `$` is nothing but a line of the csv file represented as a JSON object streamed by
<a href="https://github.com/mafintosh/csv-parser" target="_blank">csv-parser</a>.

The `index` value is given $ number starting at `0`. Meaning `index` of the first $ (which is not the column names header)
equals `0`.

```shell
csv-tr contacts.csv -f '/@gmail.com$/i.test($.email)' > gmail-contacts.csv
```

`gmail-contacts.csv` would look like:

```csv
name,email,state
Juan,juan@gmail.com,FL
Jesus,jesus@gmail.com,NY
```

**Slicing a given range of rows using the `index` value**

```shell
csv-tr contacts.csv -f 'index > 0 && index < 2'
```

Would output:

```csv
name,email,state
Miguel,miguel@hotmail.com,NY
```

### Transforming rows

Transforming values using the option `--transform` or `-t` followed by a JavaScript expression that will be evaluated
against a function that looks like.

```js
($, index) => {
  /* your js mutations go here */
}
```

Alternatively a file that exports a function with the same signature is also accepted:

```js
// my-transform-file
module.exports = ($/* , index */) => {
  $.name = $.name.toUpperCase()
  $.email = $.email.toUpperCase()
  $.initial = $.name[0]

  return $
}
```

Using the same `contacts.csv` [input sample](#input-sample).

```shell
csv-tr contacts.csv -t '{ name: $.name.toUpperCase(), email: $.email.toUpperCase(), initial: $.name[0] }' > contacts-uppercase.csv
```

`contacts-uppercase.csv` would look like:

```csv
name,email,state,initial
JUAN,JUAN@GMAIL.COM,FL,J
MIGUEL,MIGUEL@HOTMAIL.COM,NY,M
JESUS,JESUS@GMAIL.COM,NY,J
```

### Selecting specific columns 

Using the same `contacts.csv` [input sample](#input-sample).

```shell
csv-tr contacts.csv -o email,state > contact-email-state.csv
```

`contact-email-state.csv` would look like:

```csv
email,state
juan@gmail.com,FL
miguel@hotmail.com,NY
jesus@gmail.com,NY
```

### Excluding specific columns

Using the same `contacts.csv` [input sample](#input-sample).

```shell
csv-tr contacts.csv -e email,state > contact-names.csv
```

`contact-names.csv` would look like:

```csv
name
Juan
Miguel
Jesus
```

### Sorting by column

Using the same `contacts.csv` [input sample](#input-sample), imagine sorting by `state` -> `DESC` and `name` -> `ASC`:

Sorting will guess numeric and date kind of values, and treat them accordingly.

```shell
csv-tr contacts.csv -s state:-1,name:1
```

Would output:

```csv
name,email,state
Jesus,jesus@gmail.com,NY
Miguel,miguel@hotmail.com,NY
Juan,juan@gmail.com,FL
```

## API Usage

Using all above's examples at once with the same `contacts.csv` [input sample](#input-sample)

```js
const fs = require('fs');
const { csvTr, sort, csvStringify } = require('csv-tr');

// un-comment any or multiple of the options below, run it and then take a look at result.csv
csvTr(fs.createReadStream('./tests/contacts.csv'), {
  // filter: ($, index) => { return /@gmail.com$/i.test($.email) },
  // transform: ($, index) => { $.name = $.name.toUpperCase(); $.email = $.email.toUpperCase(); return $ },
  // only: ['email', 'state'],
  // exclude: ['email', 'state'],
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
