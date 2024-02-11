# Arpadroid Themes
<p>
    Aiming to deliver CSS scalability, maintainability and performance, and ultimately striving to boost CSS development experience, productivity and efficiency, Arpadroid Themes package helps bundling stylesheets across your application into different stylesheets or themes.
</p>

<section>
    <h2><i>To be, or not to be:</i> the reason behind this package.</h2>
    <p>
        I built this package to solve a problem that became quite frustrating as every application I stumbled upon suffered of it: the impossibility to get live reload working properly during CSS/SCSS/LESS development in different Angular/React applications which used different versions of Webpack 4 and 5. What I mean by <b>live reload</b> is that when you save a stylesheet, the style change will reflect instantly in your browser and <b>without any loss of state</b>. I have to emphasize the last part because it is specially helpful when dealing with the nowadays ubiquitous Single Page Application. It means the following: say you were styling a modal which takes three clicks to get to; Saving a style and seeing it reflected in the browser should not have you go through those three clicks again, and you should ideally see the change happen instantly and without having to refresh the browser. This is very important, at least if you want to boost CSS developer productivity, reduce developer frustration, and increase developer experience. Actually it's an incredible productivity booster.
    </p>
    <p>
        Being frustrated with complex build tools and bundlers and configurations that didn't really work or do what I wanted, I decided to give a shot at bundling the stylesheets myself and this package is what I ended up coming up with.
    </p>
     <p>
        Having used different versions of this script in different applications I learned a few things about CSS performance and architecture and how they could be leveraged with this script.
    </p>
    <p>
        Keep reading to learn more...
    </p>
</section>

<section>
    <h2>Features</h2>
    <ol>
        <li>
            <p>
            Easily bundle one or multiple theme stylesheets from sources across your application's source code. 
            <br/>
            </p>

> [!TIP] 
> You can use multiple stylesheets in your application and toggle them interactively or based in application logic.<br/> 
> Imagine you wanted to switch between a light and dark theme, or have a theme for different user roles, or even a theme for different application states, this is all easy with Arpadroid Themes.<br/>
> <b>Why?:</b> Instead of having to create a class name for each state and introduce more specificity into your stylesheet, you can encapsulate your styles in different stylesheets and leverage the cascade by toggling them as required. This helps create a more maintainable, scalable and performant CSS architecture.

</li>
    <li>
        <p>
            Supports LESS and SCSS, minifies your CSS in production mode, and automatically re-compiles your stylesheets when changes are made during development. 
        </p>
    </li>
    <li>
        <p>
            It's lightweight and integrates seamlessly with live reload, increasing CSS developer experience and productivity.
        </p>
    </li>
    <li>
        <p>
            Use it alongside any build system, toolchain, framework or application.
        </p>
    </li>
    </ol>
</section>
<section>
    <h2>Theme Configuration and Setup</h2>
    <ol>
        <li>To install the NPM package please run <b>npm i arpadroid-themes</b></li>
        <li>
            <p>
                The main styles and CSS assets for each theme will be kept under a directory within your application source code with a name and location of your own choosing. The name of this directory will represent the name of the theme e.g <b>default</b>, <b>dark</b>, <b>light</b>, etc... You can have as many theme directories as you like, each will produce a single stylesheet.
            </p>
        </li>
        <li>
            <p>
                A JSON configuration file is required at the root of each theme directory, the naming convention is <b>[directoryName].config.json</b> e.g <b>../themes/default/default.config.json</b>, <b>../themes/dark/dark.config.json</b>, <b>../themes/light/light.config.json</b>, etc...        
            </p>
        </li>
        <li>
            <p>
                At a minimum, the configuration file should define the theme stylesheets through the includes property.
                The stylesheet includes are relative to the theme directory and the extension should be omitted. e.g:
            </p>

```javascript
{
    "includes": [
        "vars/colors",
        "vars/easing",
        "vars/layout",
        "vars/screen",
        "vars/typography",
        "vars/animations",
        "vars/variables",
        "vars/fonts",
        "main",
        "components/headings",
        "components/lists",
        "components/scrollbar",
        "components/summary",
        "components/link",
        "components/code",
        "components/blockquote"
    ]
}
```

> [!TIP] 
    > It's good to avoid the use of <b>@import</b> in your CSS altogether because it creates HTTP requests, which can greatly affect performance and scalability creating a bottleneck during the loading phase. It is best to define your imports as shown above and all files will be concatenated into a single file at the root of your theme directory. Therefore any assets referenced from any stylesheet, no matter where this file might be in your application, will be relative to the theme directory. This helps simplify development.
    <br/>
<p>
<br/>
    For all other documentation on the theme bundler configuration options please refer to the <b>ThemeBundlerInterface</b>
    
```ts
export interface ThemeBundlerInterface {
    /**
     * @property {string} path - The absolute path to the theme directory containing all stylesheets.
     * It is NOT required via the file config [themeName].config.json.
     * It is the only required property when creating an instance of the ThemesBundler and defining the themes array.
     * Check it out in the the sample script demo/css/bundle.js.
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
     * Note: the ThemesBundler will allow you to have different themes with different extensions.
     * You have the possibility to have a theme with a .less extension and another with a .scss extension.
     */
    extension?: 'css' | 'less' | 'scss';

    /**
     * @property {string} commonThemeFile - A path to a common stylesheet that will be used as a base for the current theme.
     * It is internally set by the ThemesBundler if we set a commonThemePath (refer to ThemesBundlerInterface).
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
     * If not specified, the script will output the styles to a file following this pattern: '/../[themeName]/[themeName].bundled.css'
     */
    target?: string;

    /**
     * @property {string} minifiedTarget - Specifies the full path and exact filename of the minified theme file.
     * If not specified, the script will output the styles to a file following this pattern: '/../[themeName]/[themeName].min.css'
     */
    minifiedTarget?: string;

    /**
     * @property {string[]} patterns - A set of absolute glob file patterns to be used when looking for theme files in other directories.
     * It is passed via the ThemesBundler config. Refer to ThemesBundlerInterface patterns property for more information.
     */
    patterns?: string[];

    /**
     * @property {boolean} verbose - If set to true it logs the output of the compilation process.
     */
    verbose?: boolean;

}
```
</p>
<p>

> [!NOTE] 
    > Any properties defined in the theme's file configuration will take preference and override any other properties defined when we instantiate the ThemesBundler and define the themes, see usage below.
</p>
        </li>
    </ol>
</section>
<section>
    <h2>Using the Themes Bundler</h2>
    <p>
        We must invoke the themes bundler at build time within a nodeJS script, this can be done in your webpack file (if you are using Webpack), via a script in your package.json or directly via CLI.
        Here is a documented demo implementation of the ThemesBundler, feel free to copy and repurpose it for you own needs:
        <br/>
    </p>

```javascript
/**
 * Sample usage of ThemesBundler.
 * The script will act based upon the --mode passed, which can be either `development` or `production`.
 * You can have a script in your package.json that runs this file with the `--mode` flag.
 * E.g. `node ./scripts/bundle.js --mode=production`.
 */
const arpadroidThemes = require('arpadroid-themes');
const { ThemesBundler } = arpadroidThemes;
const argv = require('yargs').argv;
const mode = argv.mode === 'production' ? 'production' : 'development';
const cwd = process.cwd();
const basePath = cwd + '/demo/css/themes';
// We instantiate the bundler.
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
````

<p>
    Once we run the script above all themes will be bundled into their respective stylesheets.
    <br/>
    For each theme, the bundler will create a file in its root directory called <b>[themeName].bundle.css</b> with the un-minified styles.
    <br/>
    If we are running the script in production mode a minified file will be created <b>[themeName].min.css</b>.
    <br/>
    If you are running the script in development mode and edit a file that belongs to a theme, the theme will be re-bundled on save.
</p>
<p>
    For detailed information about the <b>ThemesBundler</b> configuration check out the <b>ThemesBundlerInterface</b>

```ts
export interface ThemesBundlerInterface {
    /**
     * @property {ThemeBundlerInterface[]} themes - An array of ThemeBundlerInterface configurations to define your themes.
     * Check the implementation in demo/css/bundle.js.
     * It is only required to define a path property for each of them.
     * E.g. themes: [{ path: '/../src/themes/default' }, { path: '/../src/themes/dark' }]
     */
    themes?: ThemeBundlerInterface[];

    /**
     * @property {string[]} patterns - A set of absolute glob file patterns to be used when looking for theme files in other directories.
     * Note these external files need to be named as follows to be recognized as theme files:
     * [filename].[themeName].[extension]  e.g. 'my-stylesheet.default.css, my-stylesheet.dark.css'.
     * Check the implementation in demo/css/bundle.js.
     * Those patterns are used to find the theme files in external directories.
     * They will pick up any files in any subdirectories as well so you are free to structure your code as you please.
     */
    patterns?: string[];

    /**
     * @property {boolean} minify - Indicates whether the bundled themes should be minified. Default is false.
     */
    minify?: boolean;

    /**
     * @property {string} commonThemePath - A path to a common theme that will be used as a base for all defined themes.
     * It can be useful when you have scss/less mixins that are required as part of the compilation process of other themes.
     * If set the script will:
     *  1. Look for a theme config file in the specified directory
     *  2. If found, it will bundle the theme.
     *  3. When compiling every other theme, it will prepend the common theme in each theme file.
     */
    commonThemePath?: string;

    /**
     * @property {string} watchPaths - Paths to be monitored for changes in external theme files, if not specified the script will use the working directory by default.
     */
    watchPaths?: string[];
}
```

</p>
</section>
<section>
    <h2>Setting up Live reload</h2>
    <ol>
        <li>
            <p>
                Install <a href="https://github.com/guard/guard-livereload">guard-livereload</a>
            </p>
        </li>
        <li>
            <p>
                Copy the <b>Guardfile</b> used in this repo and drop it at the root of your project, modify as needed.
            </p>
        </li>
        <li>
            <p>
                Using the CLI, go to the root of your project's source code (the same location where your <b>Guardfile</b> is), and run the command <b>guard</b>.
            </p>
        </li>
        <li>
            <p>
                Grab and install the livereload browser extension here: <a href="https://chromewebstore.google.com/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei">LiveReload for Chrome</a>
            </p>
        </li>
        <li>
            <p>
            Navigate to your project's local URL in your browser.
            <br/>

> [!IMPORTANT]
> Livereload will not work if you open an HTML file directly in your browser, you need a local server running e.g. <b>localhost:8080</b>
            </p>
        </li>
        <li>
            <p>
                Activate livereload extension in your browser.<br/>
                Once you do this the CLI running the <b>guard</b> process should say <b>Browser Connected</b>.
            </p>
        </li>
        <li>
            <p>
                <b>Enjoy CSS development!</b>
                <br/>
                With all setup correctly, any time you save a change in a CSS file your browser should reflect the change instantly and without affecting the state of your page.
            </p>
        </li>
    </ol>
</section>
<section>
    <h2>Setting up Webpack</h2>
    <ol>
        <li>
            <p>
                In order to integrate the script with Webpack you'll need to invoke the <b>ThemesBundler</b> within the <b>webpack.config.js</b>

```javascript
const arpadroidThemes = require('arpadroid-themes');
const { ThemesBundler } = arpadroidThemes;
const argv = require('yargs').argv;
const mode = argv.mode === 'production' ? 'production' : 'development';
const cwd = process.cwd();
const basePath = cwd + '/demo/css/themes';

const bundler = new ThemesBundler({
    themes: [
        { path: `${basePath}/default` },
        { path: `${basePath}/dark` }
    ],
    patterns: [`${cwd}/demo/css/components/**/*`, `${cwd}/demo/css/pages/**/*`],
    minify: mode === 'production',
    commonThemePath: basePath + '/common'
});

module.exports = (async () => {
    await bundler.promise;
    bundler.cleanup();
    await bundler.bundle();
    if (mode === 'development') {
        bundler.watch();
    }
    return [{
        // ...webpackConfig
    }]
};
```

</p>
        </li>
        <li>
            <p>Finally you will have to export your bundled stylesheets and their corresponding assets. To do so, you can use the <b>copy-webpack-plugin</b> in the webpack config like in the example below: </p>

```javascript
const CopyPlugin = require('copy-webpack-plugin');
```

```javascript
// webpack config...
plugins: [
    // webpack plugins...
    new CopyPlugin({
        patterns: [
            {
                // exporting the minified style
                from: 'demo/css/themes/default/default.min.css',
                to: cwd + '/dist/themes/default/default.min.css'
            },
            {
                // exporting assets
                from: './demo/css/themes/default/fonts',
                to: cwd + '/dist/themes/default/fonts'
            },
            {
                from: 'modules/theme/themes/dark/dark.min.css',
                to: cwd + '/dist/themes/dark/dark.min.css'
            }
        ]
    })
];
```

</li>
    </ol>
</section>
<br/>

<p>
    If you want to collaborate, have any ideas or feedback, feel free to reach out through my GitHub email.
</p>

<p>
    <b>One last note:</b> there is a <a href="https://github.com/arpadroid/themes/tree/main/demo/css">working demo</a> included as part of this repo, which has more information and a few tricks. Don't forget to check it out, to do so open up <b>demo.html</b> in your browser and have a play with it. I have added some practical examples as to how this package can be leveraged, and I'll be adding more with time.<br/> 
</p>
