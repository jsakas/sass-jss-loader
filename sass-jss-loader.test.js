const fs = require('fs');
let sassJssLoader = require('./sass-jss-loader');

// bind query to loader, "query" is used in loader-utils as "options"
sassJssLoader = sassJssLoader.bind({
  query: {
    debug: './test/module.js',
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
  });

  it('exports a themeFactory that allows you to swap out variables', () => {
    const jss = testModule.themeFactory({
      '$color-1': 'blue',
    })
    expect(jss.Button.background).toBe('blue');
  })
});
