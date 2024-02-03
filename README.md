# Themes

<p>
    Aiming to deliver CSS scalability, maintainability and performance, and ultimately striving to boost CSS development experience, productivity and efficiency, Arpadroid Themes package helps compiling stylesheets across your application into different stylesheets or themes.
</p>
<section>
<h3>Features</h3>
<div class="summary-content">
    <ol>
        <li>
            Easily create one or multiple theme stylesheets compiled from sources across your application's source code. 
            <br/><br/>
            <strong>Tip:</strong> You can use these stylesheets in combination and toggle them interactively or based on application logic.<br/> 
            Imagine you wanted to switch between a light and dark theme, or have a theme for different user roles, or even a theme for different application states, this is all easy with Arpadroid Themes.
            <br/><br/>
            <strong>Why?:</strong> Instead of having to create a class name for each state and introduce more specificity into your stylesheet, you can encapsulate your styles in different stylesheets and leverage the cascade by toggling them as required; this helps create a more maintainable, scalable and performant CSS architecture.
            <br/><br/>
        </li>
        <li>
            Supports LESS and SCSS, minifies your CSS in production mode, and automatically re-compiles your stylesheets when changes are made during development. 
            <br/><br/>
        </li>
        <li>
            It's lightweight, and integrates seamlessly with live reload, increasing CSS developer experience and productivity.
            <br/><br/>
        </li>
        <li>
            Use it alongside any build system, toolchain, framework or application.
            <br/><br/>
        </li>
    </ol>
</div>
</section>
<details openn>
    <summary><h3>Theme Configuration and Setup</h3></summary>
    <div class="summary-content">
        <ol>
            <li>
                <p>
                The main styles and CSS assets for each theme will be kept under a directory within your application source code with a name and location of your own choosing. The name of this directory will represent the name of the theme e.g 'default', 'dark', 'light', etc...<br/> You can have as many theme directories as you like, each will produce a single stylesheet.
                </p>
            </li>
            <li>
                <p>
                A JSON configuration file is required at the root of each theme directory, the naming convention is '[directoryName].config.json'
                e.g '../themes/default/default.config.json', '../themes/dark/dark.config.json', '../themes/light/light.config.json', etc...        
                </p>
            </li>
            <li>
            <p>
                At minimum, the configuration file should define the theme stylesheets through the includes property.
                    The stylesheet includes are relative to the theme directory and the extension should be omitted. e.g:
                    https://github.com/arpadroid/themes/blob/15d3474def3478c36a24081c3762ce636bb23745/demo/css/themes/default/default.config.json#L1-L19
            </p>
            <p>
                    Tip: We do not promote the use of CSS @import because it creates HTTP requests and this can greatly affect preformance and scalability creating a bottleneck during the loading phase.
                    It's best to define your imports as shown above and all files will be concatenated into a single file at the root of your theme directory.
                    Therefore any assets referenced from any stylesheet, no matter where this file might be in your application, will be relative to the theme directory. 
                    This helps simplify development.
                </p>
            </li>
            <li>
                <p>
                For all other documentation on the configuration options please refer to the ThemeCompilerInterface
                https://github.com/arpadroid/themes/blob/788e73b99cd5c96ef0dab47878af5e618864b10f/src/themeCompilerInterface.d.ts#L1-L49
                </p>
            </li>
        </ol>
    </div>
</details>
<details>
    <summary><h3>Using the Themes Compiler</h3></summary>
    <div class="summary-content">
        <p>
            We must invoke the compiler at build time within a nodeJS script, this can be done in your webpack file, via a script in your package.json or directly via CLI.
            Here is a documented demo implementation of the ThemesCompiler, feel free to copy and repurpose it for you own needs:
            https://github.com/arpadroid/themes/blob/15d3474def3478c36a24081c3762ce636bb23745/demo/css/compile.js#L1-L48
        </p>
        <p>
            Once we run the script above all themes will be compiled into their respective stylesheets.
            For each theme, the compiler will create a file called <strong>[themeName].compiled.css</strong> with the un-minified styles.
            If we are running the script in production mode a minified file will be created <strong>[themeName].min.css</strong> .
        </p>
        <p>
            For detailed information about the ThemesCompieler options check out the ThemesCompilerInerface:
            https://github.com/arpadroid/themes/blob/15d3474def3478c36a24081c3762ce636bb23745/src/themesCompilerInterface.d.ts#L1-L38
        </p>
    </div>
</details>
<details>
    <summary><h2>Setting up Live reload</h2></summary>
    <div class="summary-content">Something small enough to escape casual notice.</div>
</details>

<!-- # https://chromewebstore.google.com/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei

# https://stackoverflow.com/questions/51126403/you-dont-have-write-permissions-for-the-library-ruby-gems-2-3-0-directory-ma -->
