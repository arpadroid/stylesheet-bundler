# Themes

<p>
    Arpadroid Themes package helps keeping your styles organized into different theme stylesheets. Aiming to deliver scalability, maintainability and performance, and ultimately striving to boost CSS development experience, productivity and efficiency, it is a stylesheet compiler that leverages the ability to create multiple stylesheets, which are compiled from different stylesheet sources across your application. 
    <br/><br/>
</p>

<details open>
    <summary><h2>Features<h2></summary>
    <div class="summary-content">
        <ol>
            <li>
                Easily create one or multiple theme stylesheets compiled from sources across your application's source code. 
                <br/><br/>
                <strong>Tip:</strong> You can use these stylesheets in combination and toggle them interactively or based on application logic.<br/> 
                Imagine you wanted to switch between a light and dark theme, or have a theme for different user roles, or even a theme for different application states, this is all easy with Arpadroid Themes.
                <br/><br/>
                <strong>Why?:</strong> Instead of having to create a class name for each state and introduce more specificity into your stylesheet, you can simply leverage the cascade by toggling a stylesheet when needed; this helps create a more maintainable, scalable and performant CSS architecture.  
                <br/><br/>
            </li>
            <li>
                Supports LESS and SCSS, minifies your CSS in production mode, and automatically re-compiles your stylesheets when changes are made during development. 
                <br/><br/>
            </li>
            <li>
                It's lightweight and integrates seamlessly with live reload, increasing CSS developer experience and productivity.
                <br/><br/>
            </li>
            <li>
                Use it alongside any build system, toolchain, framework or application.
                <br/><br/>
            </li>
        </ol>
    </div>
</details>
<details>
    <summary><h2>Theme Configuration</h2></summary>
    <div class="summary-content">
        <ol>
            <li>
                <p>
                    The main theme styles will be kept under a directory within your application source code with a name and location of your own choosing. The name of this directory will represent the theme name e.g 'default', 'dark', 'light', etc...
                </p>
                <p>
                    A JSON configuration file is required in the root of this directory, the naming convention is '[directoryName].config.json'
                    e.g 'default/default.config.json', 'dark/dark.config.json', 'light/light.config.json', etc...
                </p>
                <p>
                    At minimum, the configuration file should define the theme stylesheets through the includes property.
                    The stylesheet includes are relative to the theme directory and the extension should be omitted. e.g:
                </p>
                <p>
                    For all other documentation on the configuration options please refer to the
                    <a href="https://github.com/arpadroid/themes/blob/main/src/themeCompilerInterface.d.ts">
                    themeCompilerInterface
                    </a>.  
                </p>
            </li>
        </ol>
    </div>
</details>
<details>
    <summary><h2>Using the Compiler</h2></summary>
    <div class="summary-content">
        <p>We must invoke the compiler within a nodeJS script, this can be done in your webpack file or invoked directly via CLI :
        Refer to the <a href="https://github.com/arpadroid/themes/blob/main/demo/css/compile.js">compile.js</a> file in this demo for an example of how to invoke the compiler.
    </p>
        <p>
            It is possible to have theme stylesheets outside the theme directory, which are compiled back to the output theme stylesheet. By convention these stylesheets will have a sub-extension matching the theme name e.g. 'buttonComponent.dark.css'.
            In order to do this, please lookup the documentation of the patterns property in <a href="https://github.com/arpadroid/themes/blob/main/src/themesCompilerInterface.d.ts">
                themesCompilerInterface
            </a>
        </p>
    </div>
</details>
<details>
    <summary><h2>Setting up Live reload</h2></summary>
    <div class="summary-content">Something small enough to escape casual notice.</div>
</details>

<!-- # https://chromewebstore.google.com/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei

# https://stackoverflow.com/questions/51126403/you-dont-have-write-permissions-for-the-library-ruby-gems-2-3-0-directory-ma -->
