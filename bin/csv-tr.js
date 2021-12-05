#!/usr/bin/env node
const { program } = require('commander');
const csv = require('csv-parser');

const { streamFromFileOrInput } = require('./utils/streamFromFileOrInput');
const { getOptions } = require('./utils/getOptions');
const { csvTr } = require('../lib/csvTr');
const { csvStringify } = require('../lib/csvStringify');
const { bubbleSort } = require('../lib/bubbleSort');

const getTransformFn = (expression) => {
    if (!expression) {
        return
    }
    return eval(`(entry) => { ${expression}; return entry; }`)
}

const getFilterFunction = (expression) => {
    if (!expression) {
        return
    }
    return eval(`(entry) => { return ${expression}; }`)
}

const getStreaming = (source) => {
    try {
        return streamFromFileOrInput(source)
    } catch (error) {}
}

const output = (stream) => {
  return stream.pipe(csvStringify()).pipe(process.stdout)
}

program
    .version('0.0.1')
    .description('csv transformer')
    .argument('[source]')
    .option('-o, --only <headers>', 'Output only specified headers (separated by comma). Not to be used with --exclude.')
    .option('-e, --exclude <headers>', 'Exclude specified headers (comma separated). Not to be used with --only.')
    .option('-t, --transformer <js-expression>', 'JS expression to transform each <entry>. Ej: -t "entry.email = entry.email.toLowerCase()"')
    .option('-f, --filter <js-expression>', 'JS expression to filter each <entry>. Ej: -f "entry.state === \'FL\'"')
    .option('-s, --sort <sort-expression>', 'Sort entries by header. Ej: -s "firstName:1,lastName:-1"')
    .action(async (source) => {
        const inputStream = getStreaming(source)

        if (!inputStream) {
            return program.help()
        }

        const opts = getOptions(program.opts())
        const { only, exclude } = opts

        const transformer = getTransformFn(opts.transformer)
        const filter = getFilterFunction(opts.filter)

        if (opts.only.length > 0 && opts.exclude.length > 0) {
            console.log(`error: option '--exclude' and '--only' cannot be used simultaneously`)
            return process.exit(1)
        }

        const csvStream = inputStream.pipe(csv()).pipe(csvTr({ transformer, filter, only, exclude }))

        if (Object.keys(opts.sort).length > 0) {
          return output(await bubbleSort(csvStream, opts.sort))
        }

        return output(csvStream)
    })

program.parse(process.argv)
