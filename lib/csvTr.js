const R = require('ramda');
const { Transform } = require('stream');

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
    return new Transform({
        objectMode: true,
        transform(entry, encoding, callback) {
            if (!filter(entry)) {
                return callback()
            }

            callback(null, getEntry(transformer(getEntry(entry, { exclude })), { only }))
        }
    })
}

module.exports = {
    csvTr
}
