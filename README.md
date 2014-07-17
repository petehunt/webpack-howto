# webpack-howto

## Goal of this guide

This is a cookbook of how to get things done with webpack. This includes most things we use at Instagram and nothing we don't use.

My advice: start with this as your webpack docs, then look at the official docs for clarification.

## Prerequisites

  * You know browserify, RequireJS or something similar
  * You see the value in:
    * Bundle splitting
    * Async loading
    * Packaging static assets like images and CSS

## 1. Why webpack?


  * **It's like browserify** but can split your app into multiple files. If you have multiple pages in a single-page app, the user only downloads code for just that page. If they go to another page, they don't redownload common code.

  * **It often replaces grunt or gulp** because it can build and bundle CSS, preprocessed CSS, compile-to-JS languages and images, among other things.

It supports AMD and CommonJS, among other module systems (Angular, ES6). If you don't know what to use, use CommonJS.

## 2. Webpack for Browserify people

These are equivalent:

```
browserify main.js > bundle.js
```

```
webpack main.js bundle.js
```

However, webpack is more powerful than Browserify, so you generally want to make a `webpack.config.js` to keep things organized:

```
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'       
  }
};
```

This is just JS, so feel free to put Real Code in there.

## 3. How to invoke webpack

Switch to the directory containing `webpack.config.js` and run:

  * `webpack` for building once for development
  * `webpack -p` for building once for production (minification)
  * `webpack --watch` for continuous incremental build in development (fast!)
  * `webpack -d` to include source maps

## 4. Compile-to-JS languages

webpack's equivalent of browserify transforms and RequireJS plugins is a **loader**. Here's how you can teach webpack to load CoffeeScript and Facebook JSX+ES6 support (you must `npm install jsx-loader coffee-loader`):

```
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'       
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: 'coffee-loader' },
      { test: /\.js$/, loader: 'jsx-loader?harmony' } // loaders can take parameters as a querystring
    ]
  }
};
```

## 5. Stylesheets and images

First update your code to `require()` your static assets (named as they would with node's `require()`):

```
require('./bootstrap.css');
require('./myapp.less');

var img = document.createElement('img');
img.src = require('./glyph.png');
```

When you require CSS (or less, etc), webpack inlines the CSS as a string inside the JS bundle and `require()` will insert a `<style>` tag into the page. When you require images, webpack inlines a URL to the image into the bundle and returns it from `require()`.

But you need to teach webpack to do this (again, with loaders):

```
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    path: './build', // This is where images AND js will go
    publicPath: 'http://mycdn.com/', // This is used to generate URLs to e.g. images
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // use ! to chain loaders
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'} // inline base64 URLs for <=8k images, direct URLs for the rest
    ]
  }
};
```

## 6. Feature flags

## 7. Multiple entrypoints

## 8. Optimizing common code

## 9. Async loading