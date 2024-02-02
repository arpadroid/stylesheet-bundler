/**
 * @typedef {import('../../src/themesCompiler').ThemesCompilerInterface} ThemesCompilerInterface
 */

/**
 * Sample usage of ThemesCompiler.
 */
const ThemesCompiler = require('../../src/themesCompiler');
const cwd = process.cwd();
const basePath = cwd + '/demo/css/themes';
const argv = require('yargs').argv;
const MODE = argv.mode === 'production' ? 'production' : 'development';
const compiler = new ThemesCompiler({
    commonThemePath: basePath + '/common',
    minify: MODE === 'production',
    patterns: [cwd + '/demo/css/components/**/*', cwd + '/demo/css/pages/**/*'],
    themes: [
        { path: basePath + '/default' },
        { path: basePath + '/mobile' },
        { path: basePath + '/desktop' },
        { path: basePath + '/dark' }
    ]
});

compiler.promise.then(() => {
    compiler.compile().then(() => MODE === 'development' && compiler.watch());
});
