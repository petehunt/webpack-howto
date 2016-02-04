## 本教程的目标

这是一本教你如何应用webpack到你的项目中的工具书。它包含了我们在`Instagram`中用到的绝大多数的内容。

我的建议：这个教程作为你第一个`webpack`的文档，学习完以后去看它的官方文档，了解更详细的说明。

## 学习的前提

  * 你了解过类似`browserify`、`RequireJS`的东西
  * 你知道:
  	* Bundle的拆分
  	* 异步的加载
  	* 打包images和css的这一类的静态资源

## 1. 为什么选择 webpack?


  * **它和browserify类似** 但是它可以把你的应用拆分成多个文件。如果你的单页应用里有很多页面，用户只会下载当前访问页面的代码。当他们访问应用中的其他页面时，不再需要加载与之前页面重复的通用代码。
  * **它可以替代gulp和grunt** 因为他可以构建打包css、预处理css、编译js和图片等。

它支持AMD和CommonJS，以及其他的模块系统(Angular, ES6)。如果你不太熟悉如何使用，就用CommonJS吧。

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

## 3. 如何调用webpack

选择一个目录下有`webpack.config.js`文件的文件夹，然后运行下面的命令:

  * `webpack` 开发环境下编译
  * `webpack -p` 产品编译及压缩
  * `webpack --watch` 开发环境下持续的监听文件变动来进行编译(非常快!)
  * `webpack -d` 引入 source maps

## 4. 编译js

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
      {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'} // 内联的base64的图片地址，图片要小于8k，直接的url的地址则不解析
    ]
  }
};
```

## 6. 功能标识（Feature flags）

项目中有些代码我们只为在开发环境（例如日志）或者是内部测试环境（例如那些没有发布的新功能）中使用，那就需要引入下面这些魔法全局变量（magic globals）：

```js
if (__DEV__) {
  console.warn('Extra logging');
}
// ...
if (__PRERELEASE__) {
  showSecretFeature();
}
```

同时还要在webpack.config.js中配置这些变量，使得webpack能够识别他们。

```js
// webpack.config.js

// definePlugin 会把定义的string 变量插入到Js代码中。
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

配置完成后，就可以使用 `BUILD_DEV=1 BUILD_PRERELEASE=1 webpack`来打包代码了。
值得注意的是，`webpack -p` 会删除所有无作用代码，也就是说那些包裹在这些全局变量下的代码块都会被删除，这样就能保证这些代码不会因发布上线而泄露。

## 7. 多个入口文件

如果你有两个页面：profile和feed。如果你希望用户访问profile页面时不加载feed页面的代码，那就需要生成多个bundles文件：为每个页面创建自己的“main module”（入口文件）。

```js
// webpack.config.js
module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // name是基于上边entry中定义的key
  }
};
```

在profile页面中插入`<script src="build/Profile.js"></script>`。feed也一样。

## 8. 优化通用代码

Feed和Profile页面存在大量通用代码(比如React、公共的样式和组件等等)。webpack可以抽离页面间公共的代码，生成一个公共的bundle文件，供这两个页面缓存使用:

```js
// webpack.config.js

var webpack = require('webpack');

var commonsPlugin =
  new webpack.optimize.CommonsChunkPlugin('common.js'); // 引入插件

module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // 为上面entry的key值
  },
  plugins: [commonsPlugin]
};
```

在上一步引入自己的bundle之前引入`<script src="build/common.js"></script>`

## 9. 异步加载

虽然CommonJS是同步加载的，但是webpack也提供了异步加载的方式。这对于单页应用中使用的客户端路由非常有用。当真正路由到了某个页面的时候，它的代码才会被加载下来。

指定你要异步加载的 **拆分点**。看下面的例子

```js
if (window.location.pathname === '/feed') {
  showLoadingState();
  require.ensure([], function() { // 这个语法痕奇怪，但是还是可以起作用的
    hideLoadingState();
    require('./feed').show(); // 当这个函数被调用的时候，此模块是一定已经被同步加载下来了
  });
} else if (window.location.pathname === '/profile') {
  showLoadingState();
  require.ensure([], function() {
    hideLoadingState();
    require('./profile').show();
  });
}
```

剩下的事就可以交给webpack，它会为你生成并加载这些额外的 **chunk** 文件。

webpack 默认会从项目的根目录下引入这些chunk文件。你也可以通过 `output.publicPath`来配置chunk文件的引入路径

```js
// webpack.config.js
output: {
    path: "/home/proj/public/assets", // webpack的build路径
    publicPath: "/assets/" // 你require的路径
}
```

## 其他

看一个真实的例子，[看看他们是怎么使用webpack](http://youtu.be/VkTCL6Nqm6Y)。这是Pete Hunt在Instagram.com中谈论webpack的视频。

## FAQ

### webpack 不仅仅是个modular

相比较browserify和browserify，在你的项目中大量的使用webpack插件才能体现出webpack的优势。当使用了插件后，代码才会被复写。其余的都是默认加载。
