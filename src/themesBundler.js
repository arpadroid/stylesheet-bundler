/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * @typedef {import('./themesBundlerInterface').ThemesBundlerInterface} ThemesBundlerInterface
 * @typedef {import('./themeBundlerInterface').ThemeBundlerInterface} ThemeBundlerInterface
 */
const PATH = require('path');
const fs = require('fs');
const ThemeBundler = require('./themeBundler');
const cwd = process.cwd();

class ThemesBundler {
    /** @type {ThemeBundlerInterface[]} themes */
    themes = [];

    /** @type {Record<string, ThemeBundlerInterface>} themesByName */
    themesByName = {};

    /** @type {ThemeBundler} commonTheme */
    commonTheme;

    /** @type {Promise<Response>[]} */
    promises;

    /** @type {Promise<Response>} */
    promise;

    /**
     * This class bundles and watches CSS/LESS/SCSS themes.
     * @param {ThemesBundlerInterface} config
     */
    constructor(config) {
        this.setConfig(config);
        this._initializeThemes();
    }

    /**
     * Sets the config for ThemeBundler.
     * @param {ThemesBundlerInterface} config
     */
    setConfig(config = {}) {
        /** @type {ThemesBundlerInterface} */
        this._config = Object.assign(this.getDefaultConfig(), config);
    }

    /**
     * Returns the default config for ThemeBundler.
     * @returns {ThemesBundlerInterface}
     */
    getDefaultConfig() {
        return {
            themes: [],
            minify: false,
            patterns: []
        };
    }

    /**
     * Instantiates ThemeBundler for each theme defined in the config.
     */
    _initializeThemes() {
        this.promises = [];
        this._initializeCommonTheme();
        const themes = this._config.themes;
        if (Array.isArray(themes)) {
            themes.forEach(themeConfig => {
                if (fs.existsSync(themeConfig?.path)) {
                    this._initializeThemeConfig(themeConfig);
                    const theme = new ThemeBundler(themeConfig);
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
     * Instantiates ThemeBundler for the common theme defined through commonThemeFile in the config.
     */
    _initializeCommonTheme() {
        const { patterns, commonThemePath } = this._config;
        if (fs.existsSync(commonThemePath)) {
            this.commonTheme = new ThemeBundler({
                path: commonThemePath,
                patterns
            });
        }
    }

    /**
     * Initializes the configuration of each ThemeBundler defined in the config.
     * @param {ThemeBundlerInterface} config
     */
    _initializeThemeConfig(config = {}) {
        config.patterns = this._config.patterns ?? config.patterns;
        if (this.commonTheme) {
            const themeName = this.commonTheme.getName();
            const path = this.commonTheme.getPath();
            config.commonThemeFile = PATH.normalize(
                `${path}/${themeName}.bundled.css`
            );
        }
    }

    /**
     * Bundles all configured themes.
     * @returns {Promise<Response[]>}
     */
    async bundle() {
        this.promises = [];
        if (this.commonTheme) {
            await this.commonTheme.bundle(this._config.minify);
        }
        return this.bundleThemes();
    }

    /**
     * Bundles all themes except the common theme.
     * @returns {Promise<Response[]>}
     */
    bundleThemes() {
        const promises = [];
        this.themes.forEach(theme => promises.push(theme.bundle(this._config.minify)));
        return Promise.all(promises);
    }

    /**
     * Watches all configured themes for changes.
     */
    watch() {
        if (this.commonTheme) {
            this.commonTheme.watch(() => this.bundleThemes());
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
     * Watches a configured path in config.watchPaths for changes, then re-bundles the theme.
     * @param {string} path
     */
    watchPath(path) {
        if (!path || !fs.existsSync(path)) {
            return;
        }
        fs.watch(path, { recursive: true }, async (event, file) => {
            if (file) {
                const ext = PATH.extname(file).slice(1);
                if (['less', 'scss', 'css'].includes(ext)) {
                    const themeName = file.split('.')[1];
                    const theme = this.themesByName[themeName];
                    if (theme) {
                        theme.bundle(this._config.minify);
                    }
                }
            }
        });
    }

    /**
     * Cleans up all bundled theme files.
     */
    cleanup() {
        if (this.commonTheme) {
            this.commonTheme.cleanup();
        }
        this.themes.forEach(theme => theme.cleanup());
    }
}

module.exports = ThemesBundler;
