# csv-tr

Utility to transform csv files

## Manifesto

Transforming long csv files using graphic user interfaces may not be the most efficient at times. I wanted a utility to
help me transform long csv files. This utility should:

- [Filter entries](#filtering-entries)
- [Transform entries](#transforming-entries)
- [Select headers](#)

## CLI Usage

```text
Usage: csv-tr [options] [source]

csv transformer

Options:
  -V, --version                    output the version number
  -o, --only <headers>             Only export defined columns (comma separated). Cannot be used along with
                                   --exclude.
  -e, --exclude <headers>          Exclude defined columns (comma separated). Cannot be used along with
                                   --only.
  -t, --transformer <js-function>  JS expression to transform each <entry>. Ej: -t "entry.email =
                                   entry.email.toLowerCase()"
  -f, --filter <js-function>       JS expression to filter each <entry>. Ej: -t "entry.state === 'FL'"
  -h, --help                       display help for command
```

Imagine a CSV file called `contacts.csv` with content

```csv
"name","email","state"
"Juan","juan@gmail.com","FL"
"Miguel","miguel@hotmail.com","NY"
"Jesus","jesus@gmail.com","NY"
```

### Filtering entries

Filtering only gmail contacts:

```shell
csv-tr contacts.csv -f "/@gmail.com$/i.test(entry.email)" > gmail-contacts.csv
```

`gmail-contacts.csv` will look like

```csv
"name","email","state"
"Juan","juan@gmail.com","FL"
"Jesus","jesus@gmail.com","NY"
```

### Transforming entries

Transforming values

```shell
csv-tr contacts.csv -t "entry.name = entry.name.toUpperCase(); entry.email = entry.email.toUpperCase();" > contacts-uppercase.csv
```

`contacts-uppercase.csv` will look like

```csv
"name","email","state"
"JUAN","JUAN@GMAIL.COM","FL"
"MIGUEL","MIGUEL@HOTMAIL.COM","NY"
"JESUS","JESUS@GMAIL.COM","NY"
```

### Including only certain headers 

Including only certain columns

```shell
csv-tr contacts.csv -o email,state > contact-email-state.csv
```

`contacts-uppercase.csv` will look like

```csv
"email","state"
"juan@gmail.com","FL"
"miguel@hotmail.com","NY"
"jesus@gmail.com","NY"
```

### Excluding certain headers

Excluding certain columns

```shell
csv-tr contacts.csv -e email,state > contact-names.csv
```

`contacts-uppercase.csv` will look like

```csv
"name"
"Juan"
"Miguel"
"Jesus"
```

## API Usage

Using all above's examples at once.

```js
const fs = require('fs');
const { csvTr } = require('csv-tr');

fs.createReadStream('contacts.csv').pipe(csvTr({
    // filter: (entry) => { return /@gmail.com$/i.test(entry.email) },
    // transformer: (entry) => { entry.name = entry.name.toUpperCase(); entry.email = entry.email.toUpperCase(); return entry }
    // only: ['email', 'state]
    // exclude: ['email', 'state]
})).pipe(fs.createWriteStream('result.csv'))
```

* * *

## License

[MIT](https://opensource.org/licenses/MIT)

&copy; 2021 Martin Rafael <tin@devtin.io>
