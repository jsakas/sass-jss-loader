import React, { Component, Fragment } from 'react';
import injectSheet, { withTheme, ThemeProvider } from 'react-jss';
import { channel } from 'theming';
import styles, { jss, themeFactory } from './Button.scss';

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
Button.themeFactory = themeFactory;
Button.defaultProps = {
  classes: {},
  theme: {},
};

export default Button;
