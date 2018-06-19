import React, { Component, Fragment } from 'react';
import ReactDOM from 'react-dom';
import { ThemeProvider } from 'react-jss';
import Button from './Button';

class App extends Component {
  render() {
    return (
      <Fragment>
        <Button>This should be green</Button>
        <Button theme={{
          buttonBg: 'blue'
        }}>This should be blue</Button>
        <Button theme={{
          buttonBg: 'red'
        }}>This should be red</Button>
      </Fragment>
    )
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
