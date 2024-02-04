# Arpadroid Themes

<p>
    Aiming to deliver CSS scalability, maintainability and performance, and ultimately striving to boost CSS development experience, productivity and efficiency, Arpadroid Themes package helps compiling stylesheets across your application into different stylesheets or themes.
</p>
<section>
    <h2>Features</h2>
    <ol>
        <li>
            Easily compile one or multiple theme stylesheets from sources across your application's source code. 
            <br/><br/>
            <strong>Tip:</strong> You can use these stylesheets in combination and toggle them interactively or based on application logic.<br/> 
            Imagine you wanted to switch between a light and dark theme, or have a theme for different user roles, or even a theme for different application states, this is all easy with Arpadroid Themes.
            <br/><br/>
            <strong>Why?:</strong> Instead of having to create a class name for each state and introduce more specificity into your stylesheet, you can encapsulate your styles in different stylesheets and leverage the cascade by toggling them as required; this helps create a more maintainable, scalable and performant CSS architecture.
            <br/><br/>
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
        <li>
            <p>
                The main styles and CSS assets for each theme will be kept under a directory within your application source code with a name and location of your own choosing. The name of this directory will represent the name of the theme e.g 'default', 'dark', 'light', etc... You can have as many theme directories as you like, each will produce a single stylesheet.
            </p>
        </li>
        <li>
            <p>
                A JSON configuration file is required at the root of each theme directory, the naming convention is `[directoryName].config.json`
                e.g `../themes/default/default.config.json`, `../themes/dark/dark.config.json`, `../themes/light/light.config.json`, etc...        
            </p>
        </li>
        <li>
            <p>
                At a minimum, the configuration file should define the theme stylesheets through the includes property.
                The stylesheet includes are relative to the theme directory and the extension should be omitted. e.g:
                https://github.com/arpadroid/themes/blob/15d3474def3478c36a24081c3762ce636bb23745/demo/css/themes/default/default.config.json#L1-L19
            </p>
            <p>
                <strong>Tip:</strong> We do not promote the use of CSS `@import` because it creates HTTP requests and this can greatly affect performance and scalability creating a bottleneck during the loading phase.
                It is best to define your imports as shown above and all files will be concatenated into a single file at the root of your theme directory.
                Therefore any assets referenced from any stylesheet, no matter where this file might be in your application, will be relative to the theme directory. 
                This helps simplify development.
            </p>
            <p>
                For all other documentation on the theme configuration options please refer to the `ThemeCompilerInterface`
                https://github.com/arpadroid/themes/blob/2e7cd0570e16c0c12fe178163c633a2198c403c7/src/themeCompilerInterface.d.ts#L1-L64
            </p>
        </li>
    </ol>
</section>
<section>
    <h2>Using the Themes Compiler</h2>
    <p>
        We must invoke the themes compiler at build time within a nodeJS script, this can be done in your webpack file, via a script in your package.json or directly via CLI.
        Here is a documented demo implementation of the ThemesCompiler, feel free to copy and repurpose it for you own needs:
        https://github.com/arpadroid/themes/blob/2e7cd0570e16c0c12fe178163c633a2198c403c7/demo/css/compile.js#L1-L37
    </p>
    <p>
        Once we run the script above all themes will be compiled into their respective stylesheets.
        <br/>
        For each theme, the compiler will create a file in its root directory called <strong>[themeName].compiled.css</strong> with the un-minified styles.
        <br/>
        If we are running the script in production mode a minified file will be created <strong>[themeName].min.css</strong> .
        <br/>
        If you are running the script in development mode and edit a file that belongs to a theme, the theme will be recompiled on save.
    </p>
    <p>
        For detailed information about the ThemesCompiler options check out the `ThemesCompilerInterface`:
        https://github.com/arpadroid/themes/blob/2e7cd0570e16c0c12fe178163c633a2198c403c7/src/themesCompilerInterface.d.ts#L1-L44
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
                Copy the `Guardfile` used in this repo and drop it at the root of your project, modify as needed.
                https://github.com/arpadroid/themes/blob/d78be3cd7b6cedf905906173cbf9eafffe0899a0/Guardfile#L1-L57
            </p>
        </li>
        <li>
            <p>
                Using the CLI, go to the root of your project's source code (the same location where your `Guardfile` is), and run the command 'guard'.
            </p>
        </li>
        <li>
            <p>
                Grab and install the livereload browser extension here: <a href="https://chromewebstore.google.com/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei">LiveReload for Chrome</a>
            </p>
        </li>
        <li>
            <p>
            Navigate to your project's local URL in your browser.<br/>
            <strong>Note:</strong> Livereload will not work if you open an HTML file directly in your browser, you need a local server running e.g. `localhost:8080`
            </p>
        </li>
        <li>
            <p>
                Activate livereload extension in your browser.<br/>
                Once you do this the CLI running the guard command should say `Browser Connected`.
            </p>
        </li>
        <li>
            <p>
                <strong>Enjoy CSS development!</strong>
                <br/>
                With all setup correctly, any time you save a change in a CSS file your browser should reflect the change instantly and without affecting the state of your page.
            </p>
        </li>
    </ol>
</section>
<p>
    <strong>One last note:</strong> there is a <a href="https://github.com/arpadroid/themes/tree/main/demo/css">working demo</a> included as part of this repo, don't forget to check it out and have a play with it. <br/> I have added some practical examples as to how this package can be leveraged, and I'll be adding more with time.<br/> 
</p>
