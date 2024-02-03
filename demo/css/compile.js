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
    minify: mode === 'production', // default is false
    /**
     * @property {ThemeCompilerInterface[]} themes - Each object in this array defines a theme configuration.
     * When instantiating themes as we do here, the path is the only required property.
     * Note: The config file of your themes will take priority and override any other properties in these objects.
     */
    themes: [
        { path: basePath + '/default' },
        { path: basePath + '/mobile' },
        { path: basePath + '/desktop' },
        { path: basePath + '/dark' }
    ],
    /**
     * @property {string[]} patterns - An array of absolute glob patterns to compile files matching these into their corresponding themes. These files must have a sub-extension matching the theme name. For example, a file named `button.default.css` it will be compiled into the `default` theme.
     */
    patterns: [cwd + '/demo/css/components/**/*', cwd + '/demo/css/pages/**/*'],
    /**
     * @property {string} commonThemePath - If you have a common theme that contains less/scss variables or mixins shared by all themes, you can define its path here. This theme will be compiled first and then all other themes will extend it.
     */
    commonThemePath: basePath + '/common'
});

// We wait until the compiler is ready.
compiler.promise.then(() => {
    // If you want to clean up the output directory before compiling, you can do it here.
    // compiler.cleanup();
    // We compile of all themes.
    compiler.compile().then(() => {
        if (mode === 'development') {
            // We watch all files for changes and recompile the themes correspondingly.
            compiler.watch();
        }
    });
});
