import { ThemeCompilerInterface } from './themeCompilerInterface';

/**
 * Options and configuration for the ThemesCompiler.
 */
export interface ThemesCompilerInterface {
    /**
     * @property {ThemeCompilerInterface[]} themes - An array of ThemeCompilerInterface configurations to define your themes.
     * Check the implementation in demo/css/compile.js.
     * It is only required to define a path property for each of them.
     * E.g. themes: [{ path: '/../src/themes/default' }, { path: '/../src/themes/dark' }]
     */
    themes?: ThemeCompilerInterface[];

    /**
     * @property {string[]} patterns - A set of absolute glob file patterns to be used when looking for theme files in other directories.
     * Note these external files need to be named as follows to be recognized as theme files:
     * [filename].[themeName].[extension]  e.g. 'my-stylesheet.default.css, my-stylesheet.dark.css'.
     * Check the implementation in demo/css/compile.js.
     * Those patterns are used to find the theme files in external directories.
     * They will pick up any files in any subdirectories as well so you are free to structure your code as you please.
     */
    patterns?: string[];

    /**
     * @property {boolean} minify - Indicates whether the compiled themes should be minified. Default is false.
     */
    minify?: boolean;

    /**
     * @property {string} commonThemePath - A path to a common theme that will be used as a base for all defined themes.
     * It can be useful when you have scss/less mixins that are required as part of the compilation process of other themes.
     * If set the script will:
     *  1. Look for a theme config file in the specified directory
     *  2. If found, it will compile the theme.
     *  3. When compiling every other theme, it will prepend the common theme in each theme file.
     */
    commonThemePath?: string;

    /**
     * @property {string} watchPaths - Paths to be monitored for changes in external theme files, if not specified the script will use the working directory by default.
     */
    watchPaths?: string[];
}
