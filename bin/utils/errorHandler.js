const errorHandler = (error) => {
  console.log('error:', error.message)
  process.exit(1)
}

module.exports = {
  errorHandler
}
