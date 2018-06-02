const fs = require('fs');
const path = require('path');
let sassJssLoader = require('./sass-jss-loader');

// bind query to loader, "query" is used in loader-utils as "options"
sassJssLoader = sassJssLoader.bind({
  query: {
    debug: './test/module.js',
    sass: {
      includePaths: [
        path.resolve(__dirname),
      ]
    }
  }
})

// load a test sass file
// side effect: creates module.js from above
sassJssLoader(fs.readFileSync('./test/base.scss', 'utf8'));

// require the generated module
const testModule = require('./test/module')

describe('sass-jss-loader', () => {
  it('exports a default function that returns a JSS object of the compiled sass', () => {
    const jss = testModule.default();
    expect(jss.Button.background).toBe('red');
    expect(jss.Button.padding).toBe('10px');
  });

  it('exports a themeFactory that allows you to swap out variables', () => {
    const jss = testModule.themeFactory({
      '$color-1': 'blue',
      '$padding-1': '20px',
    })
    expect(jss.Button.background).toBe('blue');
    expect(jss.Button.padding).toBe('20px');
  });

  /**
   * TODO - https://github.com/postcss/postcss-scss/issues/90
   * 
      .Interpolated {
        margin: #{$number}rem;
      }
   */
  it.skip('works with sass interpolated strings', () => {
    expect(testModule.default().Interpolated.margin).toBe('10rem');
    expect(testModule.default({
      '$number': 20,
    }).Interpolated.margin).toBe('20rem');
  })

  it('resolves variables from @import statements', () => {
    expect(testModule.defaultSassVars).toHaveProperty('$imported-var');
  });
});
