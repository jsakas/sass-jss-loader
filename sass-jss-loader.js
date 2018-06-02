const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const md5 = require('js-md5');
const sass = require('node-sass');
const jssCli = require('jss-cli');
const loaderUtils = require('loader-utils');

const themeFactory = (variables) => {
  let replaced = JSON.stringify(template);

  for (let hash in hashMap) {
    const userVar = variables[hashMap[hash]];
    const fallback = defaults[hashMap[hash]]

    if (userVar) {
      replaced = replaced.replace(new RegExp(hash, 'g'), userVar)
    } else {
      replaced = replaced.replace(new RegExp(hash, 'g'), fallback)
    }
  }

  return JSON.parse(replaced);
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

  const jss = jssCli.cssToJss({ 
    code: sass.renderSync({ 
      data: root.toResult().css 
    }).css.toString() 
  })['@global'];

  const hashMap = {};
  const defaults = {};

  /**
   * Replace all variables with a hashed value, and store the defaults in an object
   */
  root.walkDecls(/\$/, decl => {
    const hash = md5(decl.prop);
    defaults[decl.prop] = decl.value
    hashMap[md5(decl.prop)] = decl.prop;
    decl.replaceWith(decl.clone({ value: hash }));
  });
  const sassTemplate = root.toResult();
  const cssTemplate = sass.renderSync({ data: sassTemplate.css, ...sassOptions }).css.toString();

  const hashedJss = jssCli.cssToJss({ code: cssTemplate })['@global']

  const styles = (theme) => {
    if (Object.keys(theme).length) {
      return theme;
    }
    return jss; 
  };

  const output = `
    const jss = ${JSON.stringify(jss)};
    const template = ${JSON.stringify(hashedJss)};
    const hashMap = ${JSON.stringify(hashMap)};
    const defaults = ${JSON.stringify(defaults)};
    const styles = ${styles.toString()};
    const themeFactory = ${themeFactory.toString()};

    export { themeFactory, defaults }
    export default styles
  `;

  // DEBUG / TEST TOOL, write the generated ES6 to file
  options.debug && fs.writeFile(options.debug, output);

  return output;
};

