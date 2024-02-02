/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * @typedef {import('./themesCompilerInterface').ThemesCompilerInterface} ThemesCompilerInterface
 * @typedef {import('./themeCompilerInterface').ThemeCompilerInterface} ThemeCompilerInterface
 */
const PATH = require('path');
const fs = require('fs');
const ThemeCompiler = require('./themeCompiler');
const cwd = process.cwd();

class ThemesCompiler {
    /** @type {ThemeCompiler} commonTheme */
    commonTheme;

    /** @type {Promise<Response>[]} */
    promises;

    /** @type {Promise<Response>} */
    promise;

    /** @type {ThemeCompilerInterface[]} themes */
    themes = [];

    /** @type {Record<string, ThemeCompilerInterface>} themes */
    themesByName = {};

    /**
     * This class compiles and watches CSS/LESS/SCSS themes.
     * @param {ThemesCompilerInterface} config
     */
    constructor(config) {
        this.setConfig(config);
        this._initializeThemes();
    }

    /**
     * Sets the config for ThemeCompiler.
     * @param {ThemesCompilerInterface} config
     */
    setConfig(config = {}) {
        /** @type {ThemesCompilerInterface} */
        this._config = Object.assign(this.getDefaultConfig(), config);
    }

    /**
     * Returns the default config for ThemeCompiler.
     * @returns {ThemesCompilerInterface}
     */
    getDefaultConfig() {
        return {
            themes: [],
            extension: 'css',
            minify: false,
            patterns: []
        };
    }

    /**
     * Instantiates ThemeCompiler for each theme defined in the config.
     */
    _initializeThemes() {
        this.promises = [];
        this._initializeCommonTheme();
        const themes = this._config.themes;
        if (Array.isArray(themes)) {
            themes.forEach(themeConfig => {
                if (fs.existsSync(themeConfig?.path)) {
                    this._initializeThemeConfig(themeConfig);
                    const theme = new ThemeCompiler(themeConfig);
                    this.promises.push(theme.promise);
                    this.themesByName[theme.getName()] = theme;
                    this.themes.push(theme);
                } else {
                    console.log(`Theme path ${themeConfig.path} does not exist.`);
                }
            });
        }
        this.promise = Promise.all(this.promises);
    }

    /**
     * Instantiates ThemeCompiler for the common theme defined through commonThemeFile in the config.
     */
    _initializeCommonTheme() {
        const { extension, patterns, commonThemePath } = this._config;
        if (fs.existsSync(commonThemePath)) {
            this.commonTheme = new ThemeCompiler({
                path: commonThemePath,
                extension,
                patterns
            });
        }
    }

    /**
     * Initializes the configuration of each ThemeCompiler defined in the config.
     * @param {ThemeCompilerInterface} config
     */
    _initializeThemeConfig(config = {}) {
        config.patterns = this._config.patterns ?? config.patterns;
        if (this.commonTheme) {
            const themeName = this.commonTheme.getName();
            const path = this.commonTheme.getPath();
            config.commonThemeFile = PATH.normalize(
                `${path}/${themeName}.compiled.${this._config.extension}`
            );
        }
    }

    /**
     * Compiles all configured themes.
     * @returns {Promise<Response[]>}
     */
    async compile() {
        this.promises = [];
        if (this.commonTheme) {
            await this.commonTheme.compile(this._config.minify);
        }
        return this.compileThemes();
    }

    /**
     * Compiles all themes except the common theme.
     * @returns {Promise<Response[]>}
     */
    compileThemes() {
        const promises = [];
        this.themes.forEach(theme => promises.push(theme.compile(this._config.minify)));
        return Promise.all(promises);
    }

    /**
     * Watches all configured themes for changes.
     */
    watch() {
        if (this.commonTheme) {
            this.commonTheme.watch(() => this.compileThemes());
        }
        this.themes.forEach(theme => theme.watch());
        this.watchPaths();
    }

    /**
     * Watches all paths in config.watchPaths for changes.
     */
    watchPaths() {
        const watchPaths = this._config.watchPaths ?? [`${cwd}/`];
        watchPaths.forEach(path => this.watchPath(path));
    }

    /**
     * Watches a configured path in config.watchPaths for changes, then re-compiles the theme.
     * @param {string} path
     */
    watchPath(path) {
        if (!path || !fs.existsSync(path)) {
            return;
        }
        fs.watch(path, { recursive: true }, async (event, file) => {
            if (file) {
                const extension = PATH.extname(file);
                if (extension === `.${this._config.extension}`) {
                    const theme = this.themesByName[file.split('.')[1]];
                    if (theme) {
                        theme.compile(this._config.minify);
                    }
                }
            }
        });
    }
}

module.exports = ThemesCompiler;
