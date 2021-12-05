const R = require('ramda');

const asArray = R.cond([
    [R.isNil, R.always([])],
    [Array.isArray, R.identity],
    [R.T, R.split(',')]
])

const semiColonValues = (string) => {
    const [key, value] = string.split(':')
    return {
        [key]: Number(value)
    }
}

const arrayAsObj = (arr) => {
    return arr.reduce((old, current) => {
        return Object.assign(old, current)
    }, {})
}

const getOptions = R.applySpec({
    only: R.compose(asArray, R.prop('only')),
    exclude: R.compose(asArray, R.prop('exclude')),
    chunk: R.prop('chunk'),
    transformer: R.prop('transformer'),
    filter: R.prop('filter'),
    sort: R.compose(arrayAsObj, R.map(semiColonValues), asArray, R.prop('sort'))
})

module.exports = {
    getOptions
}
