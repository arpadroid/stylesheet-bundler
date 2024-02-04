/**
 * Sample usage of ThemesCompiler.
 * The script will act based upon the --mode passed, which can be either `development` or `production`.
 * You can have a script in your package.json that runs this file with the `--mode` flag.
 * E.g. `node ./scripts/compile.js --mode=production`.
 * @typedef {import('../../src/themeCompilerInterface').ThemeCompilerInterface} ThemeCompilerInterface
 */
const ThemesCompiler = require('../../src/themesCompiler');
const argv = require('yargs').argv;
const mode = argv.mode === 'production' ? 'production' : 'development';
const cwd = process.cwd();
const basePath = cwd + '/demo/css/themes';
// We instantiate the themes compiler.
const compiler = new ThemesCompiler({
    themes: [
        { path: basePath + '/default' },
        { path: basePath + '/mobile' },
        { path: basePath + '/desktop' },
        { path: basePath + '/dark' }
    ],
    patterns: [cwd + '/demo/css/components/**/*', cwd + '/demo/css/pages/**/*'],
    minify: mode === 'production',
    commonThemePath: basePath + '/common'
});

// We wait until the compiler is ready.
compiler.promise.then(() => {
    // We clean up the output directory of each theme before compiling.
    compiler.cleanup();
    // We compile of all themes.
    compiler.compile().then(() => {
        if (mode === 'development') {
            // We watch all files for changes and recompile the themes correspondingly.
            compiler.watch();
        }
    });
});
