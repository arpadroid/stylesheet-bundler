/**
 * Represents the interface for the theme compiler.
 */
export interface ThemeCompilerInterface {
    /**
     * The path to the theme directory containing all stylesheets.
     * It is required when passing it to the ThemesCompiler config.
     */
    path?: string;
    /**
     * An array of stylesheet paths to be included in the compilation process. The paths are relative to the theme directory and should not include the file extension.
     * e.g. 'main', 'variables/colors', 'variables/sizes' etc...
     */
    includes?: string[];
    /**
     * A set of absolute glob file patterns to be used when looking for theme files in other directories. Note these external files need a sub-extension of .<themeName>.<extension> to be recognized as theme files e.g. 'my-stylesheet.default.css, my-stylesheet.dark.css'.
     */
    patterns?: string[];
    /**
     * The common theme file is a file that is prepended at the start of the theme file.
     * The value is inherited and received from the ThemesCompiler configuration.
     */
    commonThemeFile?: string;
    /**
     * The configuration file for the theme config.
     * It is required to have a config file for any theme, if the path is not specified in the configuration, then the script will look for a file following this pattern: '<themes_path>/<theme_name>/<theme_name>.config.json'
     */
    configFile?: string;
    /**
     * The extension of the theme files.
     * Can be either 'css', 'less', or 'scss'.
     */
    extension?: 'css' | 'less' | 'scss';
    /**
     * Specifies the full path and exact filename of the output minified theme file after compilation.
     * If not specified, the script will output the styles to a file following this pattern: '<themes_path>/<theme_name>/<theme_name>.min.<extension>'
     */
    minifiedTarget?: string;
    
    /**
     * Specifies the full path and exact filename of the output theme file after compilation.
     * If not specified, the script will output the styles to a file following this pattern: '<themes_path>/<theme_name>/<theme_name>.compiled.<extension>'
     */
    target?: string;
    /**
     * If set to true logs the output of the compilation process.
     */
    verbose?: boolean;
}
