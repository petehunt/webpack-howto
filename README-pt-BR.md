# Web-pack Guia Inicial

## Objetivo deste guia

Este é um guia de como fazer as "coisas" utilizando o webpack. Este guia inclui a maioria das coisas que utilizamos no Instagram e "nada que não utilizamos".

Meu conselho: comece com este guia como se fosse a documentação do webpack, e então apenas utilize a documentação oficial para esclarecimento.

## Pré-requisitos

  * Conhecer browserify, RequireJS ou alguma ferramenta similar
  * Ver o valor de:
    * Divisão de pacotes
    * Carregamento Assícrono
    * Empacotamento de recursos estáticos, como imagens e CSS

## 1. Por que webpack?


  * **É como browserify** mas pode dividir sua aplicação em múltiplos arquivos. Se você tem múltiplas páginas na sua single-page application, o usuário baixa o código apenas para aquela página. Se ele vai para outra página, ele não irá baixar novamente código em comum.

  * **Frequentemente substitui grunt ou gulp** pois pode buildar e empacotar CSS, CSS pré-processado, linguagens que compilam para JS e imagens, entre outras coisas.

Suporta AMD e CommonJS, entre outros sistemas modulares (Angular, ES6). Se você não sabe o que usar, use CommonJS.

## 2. Webpack pra quem usa Browserify

Esses são equivalentes:

```js
browserify main.js > bundle.js
```

```js
webpack main.js bundle.js
```

Porém, webpack é mais poderoso que o Browserify, sendo assim você geralmente irá querer criar um arquivo `webpack.config.js` pra manter as coisas organizadas:

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'       
  }
};
```

Isso é só JS, então sinta-se livre pra colocar código de verdade lá.

## 3. Como invocar webpack

Mude para o diretório contendo `webpack.config.js` e execute:

  * `webpack` pra buildar uma vez para o desenvolvimento
  * `webpack -p` pra buildar uma vez para produção (minificação)
  * `webpack --watch` pra buildar continuamente de forma incremental no desenvolvimento (rápido!)
  * `webpack -d` para incluir source maps

## 4. Linguagens que compilam para JS

O equivalente do webpack para os plugins transform e RequireJS do browserify é um **loader**. Aqui está como você pode ensinar webpack a carregar o suporte para CoffeeScript e Facebook JSX+ES6 (execute `npm install babel-loader coffee-loader`):

Veja também [instruções de instalação do babel-loader](https://www.npmjs.com/package/babel-loader) para dependências adicionais (tl;dr execute `npm install babel-core babel-preset-es2015 babel-preset-react`).

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

Para habilitar requisição de arquivos sem especificar a extensão, você deve adicionar um parâmetro `resolve.extensions` especificando quais arquivos o webpack deve procurar:

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
    // agora você pode usar require('file') ao invés de require('file.coffee')
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
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' } // inline base64 URLs for <=8k images, direct URLs for the rest
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

## Recursos Adicionais

Dê uma olhada em um exemplo real de como uma equipe bem sucedida está alavancando o webpack: http://youtu.be/VkTCL6Nqm6Y
Este é pete Hunt na OSCon falando sobre o uso de webpack no Instagram.com

## FAQ

### webpack não parece modular

webpack é **extremamente** modular. O que faz o webpack excelente é que ele deixa plugins se injetarem em mais lugares no processo de build quando comparado à alternativas como browserify e requirejs. Muitas coisas que podem parecer nativas são apenas plugins que são carregados por padrão e podem ser sobrecarregados (ex: o parser require() do CommonJS).


