const R = require('ramda');

const asArray = R.cond([
    [R.isNil, R.always([])],
    [Array.isArray, R.identity],
    [R.T, R.split(',')]
])

const getOptions = R.applySpec({
    only: R.compose(asArray, R.prop('only')),
    exclude: R.compose(asArray, R.prop('exclude')),
    chunk: R.prop('chunk'),
    transformer: R.prop('transformer'),
    filter: R.prop('filter')
})

module.exports = {
    getOptions
}
