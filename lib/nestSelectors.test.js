const nestSelectors = require('./nestSelectors');

describe('nestSelectors', () => {
  it('does not transform things it shouldn\'t', () => {
    const INPUT = {
      "button": {
        "fontFamily": "Arial, sans-serif",
      }
    }

    expect(nestSelectors(INPUT)).toEqual(INPUT)
  })

  it('works with a basic button', () => {
    const INPUT = {
      '.button:hover': {
        color: 'red'
      }
    };

    const OUTPUT = {
      '.button': {
        '&:hover': {
          color: 'red'
        }
      }
    };

    expect(nestSelectors(INPUT)).toEqual(OUTPUT);
  });

  it('works with a more advanced button', () => {
    const INPUT = {
      '.button:hover div:active': {
        color: 'red'
      }
    };

    const OUTPUT = {
      '.button': {
        '&:hover div': {
          '&:active': {
            color: 'red'
          }
        }
      }
    };

    expect(nestSelectors(INPUT)).toEqual(OUTPUT);
  });

  it('does not infinitely loop when the prop starts with the selector', () => {
    const INPUT = {
      '&:hover div:active': {
        color: 'red'
      }
    }

    const OUTPUT = {
      '&:hover div': {
        '&:active': {
          color: 'red'
        }
      }
    }

    expect(nestSelectors(INPUT)).toEqual(OUTPUT);
  });

  it('works with ~ selector', () => {
    const INPUT = {
      ".input ~ label": {
        "top": "18px"
      }
    }

    const OUTPUT = {
      ".input": {
        "&~ label": {
          "top": "18px"
        }
      }
    }

    expect(nestSelectors(INPUT, '~')).toEqual(OUTPUT);
  })
});