const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssScss = require('postcss-scss');
const easyImport = require('postcss-easy-import');
const sass = require('node-sass');
const { preJSS } = require('prejss');
const loaderUtils = require('loader-utils');
const camelCase = require('camelcase-css');

/**
 * Walk a PostCSS tree and convert and Sass variables to a javascript function.
 * @param {Root} PostCSS Root 
 */
const templateStrings = (root) => {
  let sassVars = {};

  root.walkDecls(/\$/, decl => {
    if (decl.value.match(/^\((\n|\r|.)+\)$/gm)) {
      console.info(`skipping, ${decl.prop}: map function is not yet supported.`)
      return 
    }
    sassVars[decl.prop] = decl.value;
  });

  root.walkDecls(decl => {
    const camelName = camelCase(decl.value).replace(/\$/g, '');
    if (decl.value && Object.keys(sassVars).indexOf(decl.value) > -1) {
      const hackSass = `
        #{"
          \${
            (props) => {
              return (props.theme && props.theme.${camelName})
                ? props.theme.${camelName}
                : '${sassVars[decl.value]}'
            }
          }
        "}
      `;

      decl.replaceWith(decl.clone({
        value: hackSass,
      }));
    }
  })

  return root;
}

/**
 * Remove `.` from CSS class names, so it can be accessed as an object property
 * with dot syntax in the component
 */
const removeDot = (root) => {
  root.walkRules(/\./, rule => {
    rule.replaceWith(rule.clone({ selector: rule.selector.replace('.', '') }))
  });

  return root;
}

/**
 * Relpace function to be used in JSON.stringify.
 * 
 * Makes funtions a parsable string that we can find and convert back to functions later.
 */
const replacer = (key, val) => {
  if (typeof val === 'function') {
    return "___" + val.toString() + "___"
  }

  return val;
}

module.exports = async function (source) {
  const callback = this.async();
  const options = loaderUtils.getOptions(this) || {};
  const sassOptions = options.sass || {};
  const themeIgnorePaths = options.themeIgnorePaths || [];

  // Allow us to fail but not hold up other Webpack processes
  const failGracefully = (e) => {
    console.error(e);
    return callback(null, 'module.exports = {}');
  }

  // Promise debug to file
  const debug = (filename) => (r) => {
    fs.writeFileSync(path.resolve(__dirname, 'debug', filename), r);
    return r;
  }

  // Shared import options (because we import twice)
  const importOptions = {
    extensions: ['.css', '.scss'],
    prefix: '_',
  }

  const JSS = await postcss()
    .use(easyImport({
      ...importOptions,
      filter: (filePath) => {
        let shouldImport = true;
        themeIgnorePaths.forEach((ignorePath) => {
          if (filePath.includes(ignorePath)) {
            shouldImport = false;
          }
        })
        return shouldImport;
      }
    }))
    .use(templateStrings)
    .use(easyImport(importOptions))
    .use(removeDot)
    .process(source, {
      syntax: postcssScss,
      from: this.resourcePath,
    })
    .then(r => sass.renderSync({ data: r.toString(), ...sassOptions }).css.toString())
    .then(r => eval('preJSS`' + r  + '`'))
    .catch(failGracefully)

  const output = `
    module.exports = ${
      JSON.stringify(JSS, replacer, '  ')
      .replace(/\"___/g, '')
      .replace(/___\"/g, '')
    }
  `;

  // DEBUG / TEST TOOL, write the generated ES6 to file
  if (options.debug) {
    const prettier = require('prettier');
    fs.writeFileSync(options.debug, prettier.format(output, { parser: 'babylon' } ));
  }

  callback(null, output);
  return;
};
