/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * @typedef {import('./themeBundlerInterface').ThemeBundlerInterface} ThemeBundlerInterface
 */
const glob = require('glob');
const PATH = require('path');
const execSync = require('child_process').execSync;
const fs = require('fs');
const argv = require('yargs').argv;
const cwd = process.cwd();
const MODE = argv.mode === 'production' ? 'production' : 'development';
const VERBOSE = argv.verbose;
// const sass = require('sass');
const { transform } = require('lightningcss');

class ThemeBundler {
    /** @type {string} path */
    path;

    /** @type {string} themeName */
    themeName;

    /** @type {'css' | 'less' | 'scss'} extension */
    extension;

    /** @type {Promise<Response>} */
    promise;

    /**
     * This class bundles and watches themes.
     * @param {ThemeBundlerInterface} config
     */
    constructor(config) {
        this.setConfig(config);
        this.promise = this._initialize();
    }

    /**
     * Sets the config.
     * @param {ThemeBundlerInterface} config
     */
    setConfig(config = {}) {
        /** @type {ThemeBundlerInterface} */
        this._config = Object.assign(this.getDefaultConfig(), config);
    }

    /**
     * Returns default config.
     * @returns {ThemeBundlerInterface}
     */
    getDefaultConfig() {
        return {
            extension: 'css',
            patterns: [],
            includes: [],
            verbose: VERBOSE
        };
    }

    /**
     * Returns the path to the config file.
     * @returns {string}
     */
    getConfigFile() {
        return PATH.normalize(`${this.path}/${this.themeName}.config.json`);
    }

    /**
     * Initializes the theme, this method should be called externally.
     */
    async _initialize() {
        const { baseTheme, path, extension } = this._config;
        this.setPath(path);
        this.themeName = this.path.split(PATH.sep).pop();
        this._fileConfig = await this._loadFileConfig();
        Object.assign(this._config, this._fileConfig || {});
        this.extension = extension;
        if (baseTheme) {
            this.setBaseTheme(baseTheme);
        }
    }

    /**
     * Sets the base theme.
     * @param {string} baseTheme - The path to the base theme.
     */
    setBaseTheme(baseTheme) {
        const baseThemePath = PATH.resolve(baseTheme);
        if (!fs.existsSync(baseThemePath)) {
            console.log(`ThemeBundler => Base theme does not exist: ${baseThemePath}`);
        }
        this.baseTheme = new ThemeBundler({
            path: baseThemePath,
            extension: this.extension
        });
    }

    /**
     * Sets the path to the theme.
     * @param {string} path - The path to the theme.
     * @throws {Error} - If the path is not a string or the path is not a directory.
     */
    setPath(path = cwd) {
        if (typeof path !== 'string' || !fs.lstatSync(path).isDirectory()) {
            console.log(`ThemeBundler => Invalid path in theme config ${this.themeName}: "${path}"`);
        }
        this.path = path;
    }

    async _loadFileConfig() {
        const configFile = this.getConfigFile();
        if (configFile && !fs.existsSync(configFile)) {
            console.log(`ThemeBundler => Config file not found for theme '${this.themeName}': ` + configFile);
            return Promise.resolve({});
        }
        const payload = await fs.readFileSync(configFile);
        return Promise.resolve(JSON.parse(payload));
    }

    /**
     * Returns the name of the theme.
     * @returns {string}
     */
    getName() {
        return this.themeName;
    }

    /**
     * Returns the path to the theme.
     * @returns {string}
     */
    getPath() {
        return this.path;
    }

    /**
     * Bundles the theme into a stylesheet.
     * @param {boolean} minify
     * @returns {Promise<Response>}
     */
    async bundle(minify = false) {
        const { verbose } = this._config;
        if (this.timeout) {
            // DEBOUNCING
            if (verbose) {
                console.log('ThemeBundler =>', 'Debouncing theme bundle: ', this.themeName);
            }
            return;
        }
        if (verbose) {
            console.info('ThemeBundler =>', 'Compiling theme:', this.themeName);
        }
        this.debounce();

        const bundledStyles = await this.mergeFiles();
        if (!bundledStyles?.length) {
            console.log('ThemeBundler =>', 'no css found in file: ', this.themeName);
            return Promise.resolve();
        }
        const targetFile = this.getTargetFile();
        const rv = await fs.writeFileSync(targetFile, bundledStyles);
        let styles = bundledStyles;
        let minifiedTargetFile = this.getMinifiedTargetFile();
        if (this.extension === 'less') {
            const targetCSS = targetFile.replace('.less', '.css');
            await this.lessToCss(targetFile, targetCSS);
            styles = fs.readFileSync(targetCSS, 'utf8');
            minifiedTargetFile = minifiedTargetFile.replace('.less', '.css');
        } else if (this.extension === 'scss') {
            const targetCSS = targetFile.replace('.scss', '.css');
            await this.scssToCss(targetFile, targetCSS);
            styles = fs.readFileSync(targetCSS, 'utf8');
            minifiedTargetFile = minifiedTargetFile.replace('.scss', '.css');
        }
        if (MODE === 'production' || minify === true) {
            const { code } = transform({
                code: Buffer.from(styles),
                minify: true
            });
            fs.writeFileSync(minifiedTargetFile, code);
        }

        await this.exportBundle();
        return rv;
    }

    /**
     * Exports the bundled theme.
     * Will create a directory with the theme name in the export path if it doesn't exist and save the minified bundle file and the fonts directory.
     */
    async exportBundle() {
        
        const exportPath = this._config.exportPath;
        if (!exportPath) {
            return;
        }
        const exportDir = PATH.normalize(`${exportPath}/${this.themeName}`);
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        const targetFile = this.getTargetFile();
        fs.copyFileSync(targetFile, PATH.normalize(`${exportDir}/${this.themeName}.bundled.css`));

        const minifiedTargetFile = this.getMinifiedTargetFile();
        fs.copyFileSync(minifiedTargetFile, PATH.normalize(`${exportDir}/${this.themeName}.min.css`));

        const fontsDIR = PATH.normalize(`${this.path}/fonts`);
        const fontsExportDIR = PATH.normalize(`${exportDir}/fonts`);
        this.exportDir(fontsDIR, fontsExportDIR);

        const imagesDIR = PATH.normalize(`${this.path}/images`);
        const imagesExportDIR = PATH.normalize(`${exportDir}/images`);
        this.exportDir(imagesDIR, imagesExportDIR);
    }
    
    async exportDir(origin, destination) {
        if (fs.existsSync(origin)) {
            if (!fs.existsSync(destination)) {
                fs.mkdirSync(destination, { recursive: true });
            }
            fs.readdirSync(origin).forEach(file => {
                fs.copyFileSync(`${origin}/${file}`, `${destination}/${file}`);
            });
        }
    }

    /**
     * Debounces the bundle method.
     */
    debounce() {
        this.timeout = setTimeout(() => {
            clearTimeout(this.timeout);
            this.timeout = null;
        }, 100);
    }

    /**
     * Merges all the theme files contents into a single string.
     * @returns {string}
     */
    async mergeFiles() {
        this.css = '';
        this.files = this.getFiles();
        if (this.baseTheme) {
            this.css += await this.getBaseTheme();
        }
        this.files.forEach(file => {
            const css = this.getCSS(file);
            if (typeof css === 'string') {
                this.css += css;
            }
        });
        return this.css;
    }

    /**
     * Bundles and returns the base theme contents.
     * @returns {Promise<string>}
     */
    async getBaseTheme() {
        await this.baseTheme.bundle();
        return await fs.readFileSync(this.baseTheme.getTargetFile()).toString();
    }

    /**
     * Returns all the theme files.
     * @returns {string[]}
     */
    getFiles() {
        const commonThemeFile = this.getCommonThemeFile();
        const includes = this.getIncludes();
        const patternFiles = this.getPatternFiles();
        return [commonThemeFile, ...includes, ...patternFiles]
            .filter(file => typeof file === 'string' && fs.existsSync(file))
            .filter(item => typeof item !== 'undefined');
    }

    /**
     * Returns the common theme file path.
     * @returns {string | undefined}
     */
    getCommonThemeFile() {
        if (this.getName() === 'common') {
            return undefined;
        }
        const file = this._config.commonThemeFile;
        if (fs.existsSync(file) && !fs.lstatSync(file).isFile()) {
            console.log(`ThemeBundler => common theme file does not exist ${file}.`);
            return undefined;
        }
        return file;
    }

    /**
     * Returns the stylesheet includes defined in the theme config.
     * @returns {string[]}
     */
    getIncludes() {
        return (this._fileConfig?.includes ?? []).map(include =>
            PATH.join(this.path, `${include}.${this.extension}`)
        );
    }

    /**
     * Returns the CSS content of a file.
     * @param {string} file
     * @returns {string}
     */
    getCSS(file) {
        let css = '';
        if (file !== this._config.commonThemeFile && file.endsWith(`.bundled.${this.extension}`)) {
            return css;
        }
        const fileContent = fs.readFileSync(file, 'utf8');
        if (!fileContent || !fileContent.length) {
            if (this._config.verbose) {
                console.log('no CSS found in file:' + file);
            }
            return;
        }
        if (MODE === 'development') {
            css += `\r\n/*\r\n File: ${file}  \r\n*/\r\n`;
        }
        css += fileContent;
        return css;
    }

    /**
     * Converts less to css.
     * @param {string} lessFile
     * @param {string} cssFile
     * @returns {string}
     */
    lessToCss(lessFile, cssFile) {
        const path = PATH.normalize('node_modules/less/bin/lessc');
        const cmd = `node ${path} ${lessFile} > ${cssFile}`;
        return execSync(cmd).toString();
    }

    /**
     * Converts scss to css.
     * @param {string} scssFile
     * @param {string} cssFile
     * @returns {string}
     */
    scssToCss(scssFile, cssFile) {
        const cmd = `sass ${scssFile} ${cssFile}`;
        return execSync(cmd).toString();
    }

    /**
     * Returns the target file where the un-minified styles will be saved.
     * @returns {string}
     */
    getTargetFile() {
        return (
            this._config?.target ?? PATH.normalize(`${this.path}/${this.themeName}.bundled.${this.extension}`)
        );
    }

    /**
     * Returns the target file where the minified styles will be saved.
     * @returns {string}
     */
    getMinifiedTargetFile() {
        return (
            this._config?.minifiedTarget ??
            PATH.normalize(`${this.path}/${this.themeName}.min.${this.extension}`)
        );
    }

    /**
     * Returns all the files that match the patterns defined in the theme config.
     * @returns {string[]}
     */
    getPatternFiles() {
        let files = [];
        this.getPatterns().map(
            pattern =>
                (files = files.concat(
                    glob.sync(pattern, {
                        cwd: this.path,
                        absolute: true,
                        ignore: ['**/.git/**', '**/node_modules/**']
                    })
                ))
        );
        return files;
    }

    /**
     * Returns the file patterns defined in the theme config.
     * @param {boolean} addExtension
     * @returns {string[]}
     */
    getPatterns(addExtension = true) {
        return this._config?.patterns?.map(pattern => this.applyPattern(pattern, addExtension)) ?? [];
    }

    /**
     * Appends the theme name sub-extension and file extension to a pattern.
     * @param {string} pattern
     * @param {boolean} addExtension
     * @returns {string}
     */
    applyPattern(pattern, addExtension = true) {
        if (pattern.indexOf('{cwd}/') === 0) {
            pattern = pattern.replace('{cwd}', cwd);
        }
        if (pattern.indexOf('../') === 0) {
            const path = `${this.path}/${pattern}`;
            pattern = PATH.resolve(path);
        }
        if (addExtension) {
            pattern += `.${this.themeName}.${this.extension}`;
        }
        return pattern;
    }

    /**
     * Watches the theme files for changes.
     * @param {(file: string, event:Event) => void} callback
     * @param {boolean} bundle
     */
    async watch(callback, bundle = true) {
        if (this.baseTheme) {
            this.baseTheme.watch(() => this.bundle(), false);
        }
        this.watchPatterns(bundle, callback);
        this.watchPath(this.path, bundle, callback);
    }

    /**
     * Watches the theme path for changes and re-bundles the theme.
     * @param {string} path - The path to watch.
     * @param {boolean} bundle - Whether to bundle the theme after a change.
     * @param {(file: string, event:Event) => void} callback - The callback to execute after a change.
     */
    watchPath(path, bundle = true, callback) {
        fs.watch(path, { recursive: true }, async (event, file) => {
            const bundledFile = `${this.themeName}.bundled.${this.extension}`;
            if (![bundledFile].includes(file) && PATH.extname(file) === `.${this.extension}`) {
                if (bundle) {
                    await this.bundle();
                }
                if (typeof callback === 'function') {
                    callback(file, event);
                }
            }
        });
    }

    /**
     * Watches the theme patterns for changes and re-bundles the theme.
     * @param {boolean} bundle - Whether to bundle the theme after a change.
     * @param {(file: string, event:Event) => void} callback - The callback to execute after a change.
     */
    watchPatterns(bundle = true, callback) {
        const patterns = this.getPatterns(false);
        if (!Array.isArray(patterns)) {
            return;
        }
        patterns.forEach(pattern => {
            const path = pattern.replace('/**/*', '');
            fs.watch(path, { recursive: true }, async (event, file) => {
                const ext = PATH.extname(file).slice(1);
                const subExt = PATH.basename(file).split('.')[1];
                if (this.extension === ext && subExt === this.themeName) {
                    if (bundle) {
                        await this.bundle();
                    }
                    if (typeof callback === 'function') {
                        callback(file, event);
                    }
                }
            });
        });
    }

    /**
     * Cleans up the bundled and minified files.
     */
    cleanup() {
        const bundledFile = `${this.themeName}.bundled.${this.extension}`;
        const minifiedFile = `${this.themeName}.min.css`;
        const files = [bundledFile, minifiedFile];
        if (this.extension !== 'css') {
            files.push(`${this.themeName}.bundled.css`);
        }
        files.forEach(file => {
            const filePath = PATH.normalize(`${this.path}/${file}`);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
}

module.exports = ThemeBundler;
