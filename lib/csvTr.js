const R = require('ramda');
const { Transform } = require('stream');

const stringify = (value) => {
    return typeof value === 'string' ? JSON.stringify(value) : value
}

const getEntry = (entry, { only , exclude } = {}) => {
    if (only && only.length > 0) {
        return R.pick(only, entry)
    }

    if (exclude && exclude.length > 0) {
        return R.omit(exclude, entry)
    }

    return entry
}

const csvTr = ({ transformer = R.identity(), filter = R.always(true), only, exclude } = {}) => {
    let headerSent = false

    const entryToCsvLine = (entry) => {
        if (!filter(entry)) {
            return ''
        }

        const transformedEntry = getEntry(transformer(getEntry(entry, { exclude })), { only })
        const headers = []

        const values = Object.entries(transformedEntry).map(([header, value]) => {
            headers.push(header)
            return stringify(value)
        }).join(',') + `\n`

        if (!headerSent) {
            headerSent = true
            return headers.map(headerName => stringify(headerName)) + `\n` + values
        }

        return values
    }

    return new Transform({
        objectMode: true,
        transform(entry, encoding, callback) {
            callback(null, entryToCsvLine(entry))
        }
    })
}

module.exports = {
    csvTr
}
