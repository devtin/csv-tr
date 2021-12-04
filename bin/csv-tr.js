#!/usr/bin/env node
const { program } = require('commander');

const csv = require('csv-parser');
const { csvTr } = require('../lib/csvTr');
const { streamFromFileOrInput } = require('./utils/streamFromFileOrInput');
const { getOptions } = require('./utils/getOptions')

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
    } catch (error) {
        return
    }
}

program
    .version('0.0.1')
    .description('csv transformer')
    .argument('[source]')
    .option('-o, --only <headers>', 'Output only specified headers (separated by comma). Not to be used with --exclude.')
    .option('-e, --exclude <headers>', 'Exclude specified headers (comma separated). Not to be used with --only.')
    .option('-t, --transformer <js-expression>', 'JS expression to transform each <entry>. Ej: -t "entry.email = entry.email.toLowerCase()"')
    .option('-f, --filter <js-expression>', 'JS expression to filter each <entry>. Ej: -f "entry.state === \'FL\'"')
    .action((source) => {
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

        inputStream.pipe(csv()).pipe(csvTr({ transformer, filter, only, exclude })).pipe(process.stdout)
    })

program.parse(process.argv)
