import React from 'react';
import Router from 'react-router'

var {DefaultRoute, Route, Routes} = Router;

import App from './App';
import Home from './Home';
import About from './About';

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="about" handler={About} />
    <DefaultRoute name="home" handler={Home} />
  </Route>
);

Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler/>, document.body);
});
