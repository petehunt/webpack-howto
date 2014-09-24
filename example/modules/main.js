/** @jsx React.DOM */

var App = require('./App');
var Home = require('./Home');
var About = require('./About');
var React = require('react');
var {DefaultRoute, Route, Routes} = require('react-router');

React.renderComponent((
  <Routes location="history">
    <Route path="/" handler={App}>
      <DefaultRoute name="home" handler={Home} />
      <Route name="about" handler={About} />
    </Route>
  </Routes>
), document.body);
