import React, { Component } from 'react';
import injectSheet from 'react-jss';
import styles from './Button.scss';

console.log('Imported styles from Button.scss', styles);

const styles_2 = {
  Button: { margin: '20px 0 20px 0' },
  Button__button:
  {
    padding: '0 25px 0 25px',
    background: 'red',
    '&:hover': { 
      background: 'blue',
      'span': {
        color: 'white',
      }
    }
  },
  Button__text: {
    color: 'black',
  }
}

const styles_3 = 
  {
    '.button span': { color: 'blue' },
    '.button:hover span': { color: 'red' }
  }

@injectSheet(styles_2)
class Button extends Component {
  render() {
    let {
      classes,
      children,
      ...extra,
    } = this.props;

    console.log('Button classes', classes);

    return (
      <div>
        <button>
          <span>HELLO WORLD</span>
        </button>
      </div>
    )

    // return (
    //   <div className={classes.Button} {...extra}>
    //     <button className={classes.Button__button}>
    //       <span className={classes.Button__text}>{children}</span>
    //     </button>
    //   </div>
    // )
  }
}
Button.defaultProps = {
  classes: {},
};

export default Button;
