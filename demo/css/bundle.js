/**
 * Sample usage of ThemesBundler.
 * The script will act based upon the --mode passed, which can be either `development` or `production`.
 * You can have a script in your package.json that runs this file with the `--mode` flag.
 * E.g. `node ./scripts/bundle.js --mode=production`.
 * @typedef {import('../../src/themeBundlerInterface').ThemeBundlerInterface} ThemeBundlerInterface
 */
const ThemesBundler = require('../../src/themesBundler');
const argv = require('yargs').argv;
const mode = argv.mode === 'production' ? 'production' : 'development';
const cwd = process.cwd();
const basePath = cwd + '/demo/css/themes';
// We instantiate the themes bundler.
const bundler = new ThemesBundler({
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

// We wait until the bundler is ready.
bundler.promise.then(() => {
    // We clean up the output directory of each theme before compiling.
    bundler.cleanup();
    // We bundle of all themes.
    bundler.bundle().then(() => {
        if (mode === 'development') {
            // We watch all files for changes and re-bundle the themes correspondingly.
            bundler.watch();
        }
    });
});
