# sass-jss-loader

> This is an experimental loader to explore a theming solution for JavaScript that supports the use of Sass variables.

Takes your Sass files and converts them each into an ES6 module.

The default export of the module is a JSS style object.

It also exports a `themeFactory`, which returns a new JSS object with any of the Sass variables replaced. 
