import React, { Component } from 'react';
import injectSheet from 'react-jss';
import styles from './Button.scss';

console.log('Imported styles from Button.scss', styles);

@injectSheet(styles)
class Button extends Component {
  render() {
    let {
      classes,
      children,
      ...extra,
    } = this.props;

    return (
      <div className={classes.Button} {...extra}>
        <button className={classes.Button__button}>
          {children}
        </button>
      </div>
    )
  }
}
Button.defaultProps = {
  classes: {},
};

export default Button;
