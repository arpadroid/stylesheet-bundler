/**
 * Represents the interface for the theme compiler.
 */
export interface ThemeCompilerInterface {
    /**
     * @property {string} path - The absolute path to the theme directory containing all stylesheets.
     * It is NOT required via the file config [themeName].config.json.
     * It is the only required property when creating an instance of the ThemesCompiler and defining the themes array.
     * Check it out in the the sample script demo/css/compile.js.
     */
    path?: string;

    /**
     * @property {string[]} includes - An array of stylesheet paths to be included in the compilation process.
     * The paths to the stylesheets are relative to the theme directory and should not include the file extension.
     * e.g. 'main', 'variables/colors', 'variables/sizes' etc...
     */
    includes?: string[];

    /**
     * @property {'css' | 'less' | 'scss'} extension - The extension of the theme files, the default is 'css'.
     * Note: the ThemesCompiler will allow you to have different themes with different extensions.
     * You have the possibility to have a theme with a .less extension and another with a .scss extension.
     */
    extension?: 'css' | 'less' | 'scss';

    /**
     * @property {string} commonThemeFile - A path to a common stylesheet that will be used as a base for the current theme.
     * It is internally set by the ThemesCompiler if we set a commonThemePath (refer to ThemesCompilerInterface).
     */
    commonThemeFile?: string;

    /**
     * @property {string} configFile - An absolute path to the configuration file for the theme config.
     * It is required to have a config file for any theme. I
     * If the configFile is not specified in the configuration, then the script will look for a file following this pattern:
     * '[themesPath]/[themeName]/[themeName].config.json' e.g. 'src/themes/default/default.config.json'
     */
    configFile?: string;

    /**
     * @property {string} target - Specifies the full path and exact filename of the output theme file after compilation.
     * The contents of this file are not minified and should be used in development mode.
     * If not specified, the script will output the styles to a file following this pattern: '/../[themeName]/[themeName].compiled.css'
     */
    target?: string;

    /**
     * @property {string} minifiedTarget - Specifies the full path and exact filename of the minified theme file.
     * If not specified, the script will output the styles to a file following this pattern: '/../[themeName]/[themeName].min.css'
     */
    minifiedTarget?: string;

    /**
     * @property {string[]} patterns - A set of absolute glob file patterns to be used when looking for theme files in other directories.
     * It is passed via the ThemesCompiler config. Refer to ThemesCompilerInterface patterns property for more information.
     */
    patterns?: string[];

    /**
     * @property {boolean} verbose - If set to true it logs the output of the compilation process.
     */
    verbose?: boolean;
}
