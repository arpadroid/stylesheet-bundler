/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * @typedef {import('./themeCompilerInterface').ThemeCompilerInterface} ThemeCompilerInterface
 */
const glob = require('glob');
const PATH = require('path');
const execSync = require('child_process').execSync;
const fs = require('fs');
const argv = require('yargs').argv;
const cwd = process.cwd();
const MODE = argv.mode === 'production' ? 'production' : 'development';
const { minify } = require('csso');

class ThemeCompiler {
    /** @type {string} path */
    path;

    /** @type {string} themeName */
    themeName;

    /** @type {string} configFile */
    configFile;

    /** @type {'css' | 'less' | 'scss'} extension */
    extension;

    /** @type {Promise<Response>} */
    promise;

    /**
     * This class compiles and watches themes.
     * @param {ThemeCompilerInterface} config
     */
    constructor(config) {
        this.setConfig(config);
        this._initializeProperties();
    }

    /**
     * Sets the config.
     * @param {ThemeCompilerInterface} config
     */
    setConfig(config = {}) {
        /** @type {ThemeCompilerInterface} */
        this._config = Object.assign(this.getDefaultConfig(), config);
    }

    /**
     * Returns default config.
     * @returns {ThemeCompilerInterface}
     */
    getDefaultConfig() {
        return {
            extension: 'css',
            patterns: []
        };
    }

    /**
     * Initializes the main properties.
     */
    _initializeProperties() {
        this.setPath(this._config.path);
        this.themeName = this.path.split(PATH.sep).pop();
        this.extension = this._config.extension;
        this.configFile = this.getConfigFile();
        this.promise = this.initialize();
    }

    /**
     * Sets the path to the theme.
     * @param {string} path - The path to the theme.
     * @throws {Error} - If the path is not a string or the path is not a directory.
     */
    setPath(path = cwd) {
        if (typeof path !== 'string' || !fs.lstatSync(path).isDirectory()) {
            throw new Error('INVALID PATH:' + path);
        }
        this.path = path;
    }

    /**
     * Returns the path to the config file.
     * @returns {string}
     */
    getConfigFile() {
        return this._config?.configFile ?? PATH.normalize(`${this.path}/${this.themeName}.config.json`);
    }

    /**
     * Initializes the theme, this method should be called externally.
     */
    async initialize() {
        this.fileConfig = await this.loadThemeConfig();
    }

    async loadThemeConfig() {
        if (this.configFile && !fs.existsSync(this.configFile)) {
            console.log(`CONFIG FILE NOT FOUND FOR ${this.themeName}: ` + this.configFile);
            return Promise.resolve({});
        }
        const rawData = await fs.readFileSync(this.configFile);
        this.fileConfig = JSON.parse(rawData);
        return Promise.resolve(this.fileConfig);
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
     * Compiles the theme into a stylesheet.
     * @param {boolean} minify
     * @returns {Promise<Response>}
     */
    async compile(minify = false) {
        if (this.timeout) {
            // DEBOUNCING
            return;
        }
        this.debounce();
        const compiled = this.mergeFiles();
        if (!compiled?.length) {
            console.log('NO CSS FOUND IN THEME: ' + this.themeName);
            return Promise.resolve();
        }
        if (this.extension === 'less') {
            await this.putLess();
        } else if (this.extension === 'scss') {
            await this.putSass();
        }
        const targetFile = this.getTargetFile();
        return this.writeFile(targetFile, compiled)
            .then(async response => {
                if (MODE === 'production' || minify === true) {
                    await this.minify(compiled, this.getMinifiedTargetFile());
                }
                return Promise.resolve(response);
            })
            .catch(response => {
                response.message = `COULD NOT WRITE TO FILE: ${targetFile}`;
                return Promise.reject(response);
            });
    }

    /**
     * Debounces the compile method.
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
            console.log(`COMMON THEME FILE DOES NOT EXIST ${file}.`);
            return undefined;
        }
        return file;
    }

    /**
     * Returns the stylesheet includes defined in the theme config.
     * @returns {string[]}
     */
    getIncludes() {
        return (this.fileConfig?.includes ?? []).map(include =>
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
        if (file.endsWith(`.compiled.${this.extension}`)) {
            return css;
        }
        const fileContent = fs.readFileSync(file, 'utf8');
        if (!fileContent || !fileContent.length) {
            return console.error('no CSS found in file:' + file);
        }
        if (MODE === 'development') {
            css += `\r\n/*\r\n File: ${file}  \r\n*/\r\n`;
        }
        css += fileContent;
        return css;
    }

    /**
     * Converts less to css and outputs to file.
     * @todo Implement method.
     */
    putLess() {
        // return this.lessToCss(this.themeFile, this.cssFile);
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
     * Converts scss to css and outputs to file.
     * @returns {Promise<Response>}
     * @todo Implement method.
     */
    putSass() {
        return Promise.resolve();
    }

    /**
     * Returns the target file where the un-minified styles will be saved.
     * @returns {string}
     */
    getTargetFile() {
        return (
            this._config?.target ??
            PATH.normalize(`${this.path}/${this.themeName}.compiled.${this.extension}`)
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
     * Writes the CSS file.
     * @param {string} file
     * @param {string} content
     * @returns {Promise<Response>}
     */
    async writeFile(file, content) {
        return fs.writeFile(file, content, err => {
            if (err) {
                console.error('ERROR', err);
                return Promise.reject(err);
            }
            return Promise.resolve({});
        });
    }

    /**
     * Minifies the CSS and writes it to a file.
     * @param {string} css
     * @param {string} destination
     * @returns {Promise<Response>}
     */
    async minify(css, destination) {
        const minified = await minify(css);
        return await this.writeFile(destination, minified.css);
    }

    /**
     * Watches the theme files for changes.
     * @param {(file: string, event:Event) => void} callback
     */
    watch(callback) {
        fs.watch(this.path, { recursive: true }, async (event, file) => {
            const compiledFile = `${this.themeName}.compiled.${this.extension}`;
            if (![compiledFile].includes(file) && PATH.extname(file) === `.${this.extension}`) {
                this.compile().then(() => {
                    if (typeof callback === 'function') {
                        callback(file, event);
                    }
                });
            }
        });
    }
}

module.exports = ThemeCompiler;
