import { ThemeCompilerInterface } from './themeCompilerInterface';

/**
 * Represents the interface for the themes compiler.
 */
export interface ThemesCompilerInterface {
    /**
     * commonThemeFile - The common theme file will be included in all compiled themes.
     * If set the script will:
     *  1. Look for a theme config file in the specified directory
     *  2. If found, it will compile the theme.
     *  3. When compiling every other theme, it will prepend the common theme in each theme file.
     */
    commonThemeFile?: string;
    /**
     * extension - The file extension for the compiled themes.
     * Can be 'css', 'less', or 'scss'. Default is 'css'.
     */
    extension?: 'css' | 'less' | 'scss';
    /**
     * An array of theme compilers.
     */
    themes?: ThemeCompilerInterface[];
    /**
     * Indicates whether the compiled themes should be minified.
     * Default is false.
     */
    minify?: boolean;
    /**
     * A set of absolute glob file patterns to be used when looking for theme files in other directories. Note these external files need a sub-extension of .<themeName>.<extension> to be recognized as theme files e.g. 'my-stylesheet.default.css, my-stylesheet.dark.css'.
     */
    patterns?: string[];
    /**
     * Paths to be monitored for changes in external theme files, if not specified the script will use cwd by default.
     */
    watchPaths?: string[];
}
