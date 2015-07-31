import React from 'react';
import {Link, RouteHandler} from 'react-router'

import './App.less';

class App extends React.Component {
  render() {
    return (
      <div>
        <header>
          <ul>
            <li><Link to="home">Home</Link></li>
            <li><Link to="about">About</Link></li>
          </ul>
        </header>

        <RouteHandler />
      </div>
    );
  }
}

export default App;
