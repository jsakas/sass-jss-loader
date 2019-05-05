const sassToJss = require('./sassToJss');

describe('sassToJss', () => {
  it('converts scss to an object', async () => {
    const INPUT = `
      button {
        color: red;
      }
    `

    const OUTPUT = {
      button: {
        color: 'red',
      }
    }

    const RESULT = await sassToJss(INPUT)
    expect(RESULT).toEqual(OUTPUT);
  })

  it.only('converts sass nesting to jss nesting', async () => {
    const INPUT = `
      Parent {
        Child {
          color: red;
        }
        
        &:hover {
          Child {
            color: blue;
          }
        }
      }    
    `

    const OUTPUT = {
      'Child': {
        color: 'red',
      },
      'Parent': {
        '&:hover': {
          '& $Child': {
            color: 'blue',
          }
        }
      },
    }

    const RESULT = await sassToJss(INPUT)
    expect(RESULT).toEqual(OUTPUT);
  })
})