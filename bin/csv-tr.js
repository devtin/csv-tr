#!/usr/bin/env node
const { program } = require('commander')
const version = require('../package.json').version

const { streamFromFileOrInput } = require('./utils/streamFromFileOrInput')
const { getOptions } = require('./utils/getOptions')
const { csvTr } = require('../lib/csvTr')
const { csvStringify } = require('../lib/csvStringify')
const { sort: streamSort } = require('../lib/sort')
const { errorHandler } = require('./utils/errorHandler')

const getTransformFn = (expression) => {
  if (!expression) {
    return
  }
  /* eslint-disable-next-line */
  return eval(`(entry) => { ${expression}; return entry; }`)
}

const getFilterFunction = (expression) => {
  if (!expression) {
    return
  }
  /* eslint-disable-next-line */
  return eval(`(entry, index) => { return ${expression}; }`)
}

const getStreaming = (source) => {
  try {
    return streamFromFileOrInput(source)
  } catch (error) {}
}

const output = (stream) => {
  return stream.pipe(csvStringify()).pipe(process.stdout)
}

const csvTrCli = async (source) => {
  const inputStream = getStreaming(source)

  if (!inputStream) {
    return program.help()
  }

  inputStream.on('error', errorHandler)

  const opts = getOptions(program.opts())
  const { only, exclude, sort } = opts

  const transformer = getTransformFn(opts.transformer)
  const filter = getFilterFunction(opts.filter)

  if (opts.only.length > 0 && opts.exclude.length > 0) {
    throw new Error('option \'--exclude\' and \'--only\' cannot be used simultaneously')
  }

  const csvStream = csvTr(inputStream, { transformer, filter, only, exclude })

  if (sort && Object.keys(sort).length > 0) {
    return output(await streamSort(csvStream, sort))
  }

  return output(csvStream)
}

program
  .version(version)
  .description('transforms given csv file or stream and outputs the result')
  .argument('[source | input stream]')
  .option('-o, --only <headers>', 'Output only specified headers (separated by comma). Not to be used with --exclude.')
  .option('-e, --exclude <headers>', 'Exclude specified headers (comma separated). Not to be used with --only.')
  .option('-t, --transformer <js-expression>', 'JS expression to transform each <entry>. Ej: -t "entry.email = entry.email.toLowerCase()"')
  .option('-f, --filter <js-expression>', 'JS expression to filter each <entry>. Ej: -f "entry.state === \'FL\'"')
  .option('-s, --sort <sort-expression>', 'Sort entries by header. Ej: -s "firstName:1,lastName:-1"')
  .action(async (source) => {
    try {
      await csvTrCli(source)
    } catch (error) {
      errorHandler(error)
    }
  })

program.parse(process.argv)
