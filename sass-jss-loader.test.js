const fs = require('fs');
const path = require('path');
let sassJssLoader = require('./sass-jss-loader');

/**
 * MOCK WEBPACK OPTIONS
 * bind stuff to `loaderContext` from the docs (aka `this`)
 * query = options
 * resourcePath = the file being loaded
 */
sassJssLoader = sassJssLoader.bind({
  query: {
    debug: path.resolve(__dirname, 'test/module.js'),
    sass: {
      includePaths: [
        path.resolve(__dirname),
      ]
    }
  },
  resourcePath: path.resolve(__dirname, 'test/base.scss'),
})

let testModule;
describe('sass-jss-loader', () => {
  beforeAll(async () => {
    // load a test sass file
    // side effect: creates module.js from above
    await sassJssLoader(fs.readFileSync('./test/base.scss', 'utf8'));

    // require the module we just generated
    testModule = require('./test/module');
  })

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
