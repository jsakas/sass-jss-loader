import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'react-jss';
import Button from './Button';

class App extends Component {
  render() {
    return (
      <ThemeProvider theme={{}}>
        <div>
          <Button>This is the default green</Button>

          <ThemeProvider theme={Button.themeFactory({ '$button-bg': 'red' })}>
            <Button>This should be red</Button>
          </ThemeProvider>
          
          <ThemeProvider theme={Button.themeFactory({ '$button-bg': 'blue' })}>
            <Button>This should be blue</Button>
          </ThemeProvider>

        </div>
      </ThemeProvider>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
