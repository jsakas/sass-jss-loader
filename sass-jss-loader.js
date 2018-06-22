const fs = require('fs');
const path = require('path');
const postcss = require('postcss');
const postcssScss = require('postcss-scss');
const easyImport = require('postcss-easy-import');
const comments = require('postcss-discard-comments');
const sass = require('node-sass');
const { preJSS } = require('prejss');
const loaderUtils = require('loader-utils');
const camelCase = require('camelcase-css');
const nestSelectors = require('./lib/nestSelectors');

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
                : '${sassVars[decl.value].replace('!default', '')}'
            }
          }
        "}
      `
        .replace(/\s\s+/g, ' ')
        .replace(/\n/g, '');

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
 * Convert `{ 'button:hover': {} }` to { button: { '&:hover': {} } }
 */
const convertPsuedoSelectors = (obj, selector = ':', prefix='') => {
  console.log('convertPsuedoSelectors', JSON.stringify(obj, null, '  '));
  const ret = {};
  for (let k in obj) {
    if (typeof k === 'string' && k.includes(selector)) {
        const arr = k.split(selector);
        let prop = arr.shift();

        if (prefix && prop.includes(prefix)) {
            prop = arr.shift();
        }

        const key = `${prefix}${prefix && selector}${arr.join(selector)}`;
        let next = {
            // ...obj[key],
            [key]: obj[k]
        }

        ret[`${prefix}${prefix && selector}${prop}`] = arr.length > 1 
            ? convertPsuedoSelectors(next, selector, prefix='&')
            : next;
    }
  }
  return ret;
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
  console.log('Sass -> Jss is attempting to load', this.resourcePath);
  const callback = this.async();
  const options = loaderUtils.getOptions(this) || {};
  const sassOptions = options.sass || {};
  const themeIgnorePaths = options.themeIgnorePaths || [];

  // Allow us to fail but not hold up other Webpack processes
  const failGracefully = (e) => {
    console.error('‼️   Sass -> JSS Failed :: ', e);
    return callback(null, 'module.exports = {}');
  }

  // Promise debug to file
  const debug = (filename) => (r) => {
    fs.writeFileSync(path.resolve(__dirname, 'debug', filename), r.toString());
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
    .use(comments({
      removeAll: true,
    }))
    .process(source, {
      syntax: postcssScss,
      from: this.resourcePath,
    })
    // .then(debug('SASS.scss'))
    .then(r => sass.renderSync({ data: r.toString(), ...sassOptions }).css.toString())
    // .then(debug('CSS.css'))
    .then(r => eval('preJSS`' + r + '`'))
    .then(nestSelectors)
    // .then(r => nestSelectors(r, '~'))
    // .then(r => {
    //   let r1 = nestSelectors(r, ':');
    //   let r2 = nestSelectors(r1, '~');
    //   return r2;

    // //   return [':', '::', '+', '~'].reduce((acc, k) => {
    // //     console.log('scanning for', k);
    // //     return convertPsuedoSelectors(acc, k)
    // //   }, r)
    // })

    .then(r => {
      // console.log(r);
      return r;
    })
    .then(debug('JS.js'))
    .catch(failGracefully)

  const output = `
    module.exports = ${
      JSON.stringify(JSS || {}, replacer, '  ')
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
