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
  async: () => jest.fn(),
})

let jss;
describe('sass-jss-loader', () => {
  beforeAll(async () => {
    // load a test sass file
    // side effect: creates module.js from above
    await sassJssLoader(fs.readFileSync('./test/base.scss', 'utf8'));

    // require the module we just generated
    jss = require('./test/module');
  })

  it('exports a JSS object of the compiled sass', () => {
    expect(jss.Button.color).toBe('white');
  });

  it('converts variables to functions that use props.theme', async () => {
    expect(typeof jss.Button.background).toBe('function');
  });

  it('converts IMPORTED variables to functions that use props.theme', () => {
    expect(typeof jss.ClassWithImportedVariable.background).toBe('function');
  });

  it('can work with font-family', () => {
    expect(typeof jss.ClassWithFontFamily.fontFamily).toBe('function');
  });

  it.only('can work with nested selectors', () => {
    console.log(JSON.stringify(jss, null, ' '));
    expect(true).toBe(true);
    // expect(jss.Child).toEqual({
    //   color: 'red',
    // })

    // expect(jss.Parent).toEqual({
    //   '&:hover $Child': {
    //     color: 'blue',
    //   }
    // })
  })

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
});
