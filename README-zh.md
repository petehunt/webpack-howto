# webpack-howto

This is a cookbook of how to get things done with webpack. This includes most things we use at Instagram and nothing we don't use.

My advice: start with this as your webpack docs, then look at the official docs for clarification.

## 本教程的目标


这是一本教你如何应用webpack到你的项目中的工具书。它包含了我们在`Instagram`中用到的绝大多数的内容。

我的建议：这个教程作为你第一个`webpack`的学习文档，之后再去看官方文档，了解更详细的说明。

## Prerequisites

  * You know browserify, RequireJS or something similar
  * You see the value in:
    * Bundle splitting
    * Async loading
    * Packaging static assets like images and CSS

## 学习的前提

  * 你了解过类似`browserify`、`RequireJS`的东西
  * You see the value in:
  	* Bundle的拆分
  	* 异步的加载
  	* 打包images和css的这一类的静态资源

## 1. Why webpack?


  * **It's like browserify** but can split your app into multiple files. If you have multiple pages in a single-page app, the user only downloads code for just that page. If they go to another page, they don't redownload common code.

  * **It often replaces grunt or gulp** because it can build and bundle CSS, preprocessed CSS, compile-to-JS languages and images, among other things.

It supports AMD and CommonJS, among other module systems (Angular, ES6). If you don't know what to use, use CommonJS.

## 1. 为什么选择 webpack?


  * **它和browserify类似** 但是它可以把你的应用拆分成多个文件。如果你的单页应用里有很多页面，用户只会下载当前访问页面的代码。当他们访问应用中的其他页面时，不再需要加载与之前页面重复的通用代码。

  * **它还可以替代gulp和grunt** 构建打包css、预处理css、编译js和处理图片等。

它支持AMD和CommonJS，以及其他的模块系统(Angular, ES6)。如果你不太熟悉如何使用，就用CommonJS吧。

## 2. Webpack for Browserify people

These are equivalent:

```js
browserify main.js > bundle.js
```

```js
webpack main.js bundle.js
```

However, webpack is more powerful than Browserify, so you generally want to make a `webpack.config.js` to keep things organized:

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  }
};
```

This is just JS, so feel free to put Real Code in there.

## 2. 对于习惯Browserify的人可以这样使用Webpack

下面的命令是等价的:

```js
browserify main.js > bundle.js
```

```js
webpack main.js bundle.js
```

然而，webpack要比Browserify强大。所以一般情况下你需要建立一个`webpack.config.js`文件来配置webpack。

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  }
};
```

这就是单纯的JS，所有写这个配置文件毫无压力。

## 3. How to invoke webpack

Switch to the directory containing `webpack.config.js` and run:

  * `webpack` for building once for development
  * `webpack -p` for building once for production (minification)
  * `webpack --watch` for continuous incremental build in development (fast!)
  * `webpack -d` to include source maps

## 3. 如何调用webpack

选择一个目录下有`webpack.config.js`文件的文件夹，然后运行下面的命令:

  * `webpack` 开发环境下编译
  * `webpack -p` 产品编译及压缩
  * `webpack --watch` 开发环境下持续的监听文件变动来进行编译(非常快!)
  * `webpack -d` 引入 source maps

## 4. Compile-to-JS languages

webpack's equivalent of browserify transforms and RequireJS plugins is a **loader**. Here's how you can teach webpack to load CoffeeScript and Facebook JSX+ES6 support (you must `npm install babel-loader coffee-loader`):

See also the [babel-loader installation instructions](https://www.npmjs.com/package/babel-loader) for additional dependencies (tl;dr run `npm install babel-core babel-preset-es2015 babel-preset-react`).

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: 'coffee-loader' },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};
```

To enable requiring files without specifying the extension, you must add a `resolve.extensions` parameter specifying which files webpack searches for:

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: 'coffee-loader' },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  resolve: {
    // you can now require('file') instead of require('file.coffee')
    extensions: ['', '.js', '.json', '.coffee']
  }
};
```

## 4. 编译js预演

webpack可以和browserify、RequireJS一样作为一个**loader**(加载工具)来使用。下面我们来看下如何使用webpack去加载、编译CoffeeScript和JSX+ES6。(这里你必须先 `npm install babel-loader coffee-loader`):

你也要看下[babel-loader的介绍](https://www.npmjs.com/package/babel-loader)，它会作为一个开发环境下的依赖加载到我们的项目中(run `npm install babel-core babel-preset-es2015 babel-preset-react`)

```js
// webpack.config.js
module.exports = {
  entry: './main.js', // 入口文件
  output: {
    filename: 'bundle.js' // 打包输出的文件
  },
  module: {
    loaders: [
      {
        test: /\.coffee$/,  // test 去判断是否为.coffee的文件,是的话就是进行coffee编译
        loader: 'coffee-loader'
      },
      {
        test: /\.js$/, // test 去判断是否为.js,是的话就是进行es6和jsx的编译
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  }
};
```

如果你希望在require文件时省略文件的扩展名，只需要在webpack.config.js中添加 `resolve.extensions` 来配置。

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.coffee$/, loader: 'coffee-loader' },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react']
        }
      }
    ]
  },
  resolve: {
    // 现在你require文件的时候可以直接使用require('file')，不用使用require('file.coffee')
    extensions: ['', '.js', '.json', '.coffee']
  }
};
```


## 5. Stylesheets and images

First update your code to `require()` your static assets (named as they would with node's `require()`):

```js
require('./bootstrap.css');
require('./myapp.less');

var img = document.createElement('img');
img.src = require('./glyph.png');
```

When you require CSS (or less, etc), webpack inlines the CSS as a string inside the JS bundle and `require()` will insert a `<style>` tag into the page. When you require images, webpack inlines a URL to the image into the bundle and returns it from `require()`.

But you need to teach webpack to do this (again, with loaders):

```js
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

## 5. Css样式和图片的加载

首先你需要用`require()`去加载你的静态资源(named as they would with node's `require()`):

```js
require('./bootstrap.css');
require('./myapp.less');

var img = document.createElement('img');
img.src = require('./glyph.png');
```

当你require了CSS(less或者其他)文件，webpack会在页面中插入一个内联的`<style>`，去引入样式。当require图片的时候，bundle文件会包含图片的url，并通过`require()`返回图片的url。

但是这需要你在`webpack.config.js`做相应的配置(这里还是使用loaders)

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    path: './build', // 图片和js会放在这
    publicPath: 'http://mycdn.com/', // 这里用来生成图片的地址
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // 用!去链式调用loader
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'} // 内联的base64的图片地址，图片要小于8k 是这样吗？？？ // inline base64 URLs for <=8k images, direct URLs for the rest
    ]
  }
};
```

## 6. Feature flags

We have code we want to gate only to our dev environments (like logging) and our internal dogfooding servers (like unreleased features we're testing with employees). In your code, refer to magic globals:

```js
if (__DEV__) {
  console.warn('Extra logging');
}
// ...
if (__PRERELEASE__) {
  showSecretFeature();
}
```

Then teach webpack those magic globals:

```js
// webpack.config.js

// definePlugin takes raw strings and inserts them, so you can put strings of JS if you want.
var definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
});

module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  },
  plugins: [definePlugin]
};
```

Then you can build with `BUILD_DEV=1 BUILD_PRERELEASE=1 webpack` from the console. Note that since `webpack -p` runs uglify dead-code elimination, anything wrapped in one of these blocks will be stripped out, so you won't leak secret features or strings.

## 7. Multiple entrypoints

Let's say you have a profile page and a feed page. You don't want to make the user download the code for the feed if they just want the profile. So make multiple bundles: create one "main module" (called an entrypoint) per page:

```js
// webpack.config.js
module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // Template based on keys in entry above
  }
};
```

For profile, insert `<script src="build/Profile.js"></script>` into your page. Do a similar thing for feed.

## 8. Optimizing common code

Feed and Profile share a lot in common (like React and the common stylesheets and components). webpack can figure out what they have in common and make a shared bundle that can be cached between pages:

```js
// webpack.config.js

var webpack = require('webpack');

var commonsPlugin =
  new webpack.optimize.CommonsChunkPlugin('common.js');

module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // Template based on keys in entry above
  },
  plugins: [commonsPlugin]
};
```

Add `<script src="build/common.js"></script>` before the script tag you added in the previous step and enjoy the free caching.

## 9. Async loading

CommonJS is synchronous but webpack provides a way to asynchronously specify dependencies. This is useful for client-side routers, where you want the router on every page, but you don't want to have to download features until you actually need them.

Specify the **split point** where you want to load asynchronously. For example:

```js
if (window.location.pathname === '/feed') {
  showLoadingState();
  require.ensure([], function() { // this syntax is weird but it works
    hideLoadingState();
    require('./feed').show(); // when this function is called, the module is guaranteed to be synchronously available.
  });
} else if (window.location.pathname === '/profile') {
  showLoadingState();
  require.ensure([], function() {
    hideLoadingState();
    require('./profile').show();
  });
}
```

webpack will do the rest and generate extra **chunk** files and load them for you.

webpack will assume that those files are in your root directory when you load then into a html script tag for example. You can use `output.publicPath` to configure that.

```js
// webpack.config.js
output: {
    path: "/home/proj/public/assets", //path to where webpack will build your stuff
    publicPath: "/assets/" //path that will be considered when requiring your files
}
```

## Additional resources

Take a look at a real world example on how a successful team is leveraging webpack: http://youtu.be/VkTCL6Nqm6Y
This is Pete Hunt at OSCon talking about webpack at Instagram.com

## FAQ

### webpack doesn't seem modular

webpack is **extremely** modular. What makes webpack great is that it lets plugins inject themselves into more places in the build process when compared to alternatives like browserify and requirejs. Many things that may seem built into the core are just plugins that are loaded by default and can be overridden (i.e. the CommonJS require() parser).
