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
const sass = require('sass');
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
            verbose: false
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
        this.setPath(this._config.path);
        this.themeName = this.path.split(PATH.sep).pop();
        this._fileConfig = await this._loadFileConfig();
        Object.assign(this._config, this._fileConfig || {});
        this.extension = this._config.extension;
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

        const bundledStyles = this.mergeFiles();
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
            const {code} = transform({
                code: Buffer.from(styles),
                minify: true
            });
            fs.writeFileSync(minifiedTargetFile, code);
        }

        return rv;
    }

    /**
     * Debounces the bundle method.
     */
    debounce() {
        this.timeout = setTimeout(() => {
            clearTimeout(this.timeout);
            this.timeout = null;
        }, 50);
    }

    /**
     * Merges all the theme files contents into a single string.
     * @returns {string}
     */
    mergeFiles() {
        this.css = '';
        this.files = this.getFiles();
        this.files.forEach(file => {
            const css = this.getCSS(file);
            if (typeof css === 'string') {
                this.css += css;
            }
        });
        return this.css;
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
     * @returns {string[]}
     */
    getPatterns() {
        return this._config?.patterns?.map(pattern => this.applyPattern(pattern)) ?? [];
    }

    /**
     * Appends the theme name sub-extension and file extension to a pattern.
     * @param {string} pattern
     * @returns {string}
     */
    applyPattern(pattern) {
        return `${pattern}.${this.themeName}.${this.extension}`;
    }

    /**
     * Minifies the CSS and writes it to a file.
     * @param {string} css
     * @param {string} destination
     * @returns {Promise<Response>}
     */
    async minify(css, destination) {
        const minified = await minify(css);
        return await fs.writeFileSync(destination, minified.css);
    }

    /**
     * Watches the theme files for changes.
     * @param {(file: string, event:Event) => void} callback
     */
    watch(callback) {
        fs.watch(this.path, { recursive: true }, async (event, file) => {
            const bundledFile = `${this.themeName}.bundled.${this.extension}`;
            if (![bundledFile].includes(file) && PATH.extname(file) === `.${this.extension}`) {
                this.bundle().then(() => {
                    if (typeof callback === 'function') {
                        callback(file, event);
                    }
                });
            }
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
