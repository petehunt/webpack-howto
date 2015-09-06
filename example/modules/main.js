var App = require('./App');
var Home = require('./Home');
var About = require('./About');
var React = require('react');
var Router = require('react-router');
var {DefaultRoute, Route, Routes} = Router;

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="about" handler={About} />
    <DefaultRoute name="home" handler={Home} />
  </Route>
);

Router.run(routes, Router.HistoryLocation, function(Handler) {
  React.render(<Handler/>, document.body);
});
