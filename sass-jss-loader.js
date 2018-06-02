const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const md5 = require('js-md5');
const sass = require('node-sass');
const cssToJss = require('./node_modules/jss-cli/lib/cssToJss');
const loaderUtils = require('loader-utils');

const themeFactory = (variables) => {
  let theme = JSON.stringify(template);

  for (let sassVar in defaultSassVars) {
    const userVar = variables[sassVar];
    const defaultVar = defaultSassVars[sassVar];
    const hashedVar = hashMap[sassVar];
    const regExp = new RegExp(hashedVar, 'g');

    let replaced;
    if (userVar) {
      replaced = theme.replace(regExp, userVar);
    } else {
      replaced = theme.replace(regExp, defaultVar);
    }
    theme = replaced;
  }

  return JSON.parse(theme);
}

module.exports = function (source) {
  const options = loaderUtils.getOptions(this) || {};
  const sassOptions = options.sass || {};
  const css = sass.renderSync({ data: source, ...sassOptions });
  const root = postcss.parse(source);

  /**
   * Remove `.` from CSS class names, so it can be accessed as an object property
   * with dot syntax in the component
   */
  root.walkRules(/\./, rule => {
    rule.replaceWith(rule.clone({ selector: rule.selector.replace('.', '') }))
  })
  const newCss = root.toResult().css;

  const jss = cssToJss({ 
    code: sass.renderSync({ 
      data: root.toResult().css 
    }).css.toString() 
  })['@global'];

  const hashMap = {};
  const defaultSassVars = {};

  /**
   * Replace all variables with a hashed value, and create hash map and default variable map. 
   * 
   * Why? We need a full CSS file with no sass variables (sass won't replace strings), so we 
   * convert them to hashes and store a hash map for later use. 
   */
  root.walkDecls(/\$/, decl => {
    // need to prefix with __ because postcss is doing something strange with the string
    const hash = `__${md5(decl.prop)}`;
    defaultSassVars[decl.prop] = decl.value
    hashMap[decl.prop] = hash;
    decl.replaceWith(decl.clone({ value: hash }));
  });
  const sassTemplate = root.toResult();
  const cssTemplate = sass.renderSync({ data: sassTemplate.css, ...sassOptions }).css.toString();

  const hashedJss = cssToJss({ code: cssTemplate })['@global']

  const styles = (theme = {}) => {
    if (Object.keys(theme).length) {
      return theme;
    }
    return jss; 
  };

  const output = `
    const jss = ${JSON.stringify(jss)};
    const template = ${JSON.stringify(hashedJss)};
    const hashMap = ${JSON.stringify(hashMap)};
    const defaultSassVars = ${JSON.stringify(defaultSassVars)};
    const styles = ${styles.toString()};
    const themeFactory = ${themeFactory.toString()};

    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    exports.themeFactory = themeFactory;
    exports.defaultSassVars = defaultSassVars;
    exports.default = styles;
  `;

  // DEBUG / TEST TOOL, write the generated ES6 to file
  if (options.debug) {
    const prettier = require('prettier');
    fs.writeFileSync(options.debug, prettier.format(output, { parser: 'babylon' } ));
  }

  return output;
};
