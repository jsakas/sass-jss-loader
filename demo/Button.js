import React, { Component } from 'react';
import injectSheet from 'react-jss';
import jss from 'jss';
import jssNested from 'jss-nested';
// import styles from './Button.scss';

jss.setup(jssNested());

// console.log('Imported styles from Button.scss', styles);

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

// const styles_3 = {
//   button: {
//     // span: {
//       color: 'blue', 
//     },
//   }
//   // '.button span': { color: 'blue' },
//   // '.button:hover span': { color: 'red' }
// }

const styles_4 = {
  button: {
    '&:hover $someClass': {
       color: 'blue',
    }
  },
  someClass: {
    color: props => {
      console.log('PROPS', props);
      return props.theme && props.theme.buttonBg || 'orange' 
    },
  }
}

@injectSheet(styles_4)
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
        <button className={classes.button}>
          <span className={classes.someClass}>HELLO WORLD</span>
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
