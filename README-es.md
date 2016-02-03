# webpack-howto

## Objetivo de esta guía

Esta es una guía sobre como lograr lo que uno quiere usando webpack. Incluye la mayoría de las cosas que utilizamos en Instagram y nada que no utilicemos.

Mi consejo: empezar con esta guía como tu documentación sobre webpack, y luego mirar la documentación oficial para aclarar conceptos y/o detalles.

## Pre-Requisitos

  * Saber sobre browserify, RequireJS o similares
  * Ver valor en:
    * Partir/fraccionar paquetes (Bundle splitting)
    * Carga asincrónica (Async loading)
    * Empaquetar contenido estático como imágenes y CSS

## 1. Por que webpack?


  * **Es como browserify** pero puede fraccionar nuestra app en múltiples archivos. Si tenemos múltiples paginas en una SPA (Single Page App), el usuario solo descarga el contenido correspondiente a la pagina actual. Si luego visita otra pagina, no vuelve a descargar código en común o repetido.

  * **Generalmente reemplaza a grunt o gulp** porque puede construir y empaquetar CSS, CSS pre-procesado, lenguajes compilables-a-JS e imágenes, entre otras cosas.

Soporta AMA, CommonJS y otros sistemas de módulos (Angular, ES6). Si no sabes que usar, usa CommonJS.

## 2. Webpack para gente que usa Browserify

Estos son equivalentes:

```js
browserify main.js > bundle.js
```

```js
webpack main.js bundle.js
```

Sin embargo, webpack es mas poderoso que Browserify, por lo que generalmente queremos crear el archivo `webpack.config.js` para organizarnos mejor:

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'
  }
};
```

Esto es puramente JS, por lo que podemos escribir Código Real adentro.

## 3. Como llamar a webpack

Entrar al directorio que contiene `webpack.config.js` y ejecutar:

  * `webpack` para construir una vez para desarrollo
  * `webpack -p` para construir una vez para producción (minificado)
  * `webpack --watch` para construir de forma continua e incremental en desarrollo (rápido!)
  * `webpack -d` para incluir mapas fuente (source maps)

## 4. Lenguajes Compilables-a-JS

El equivalente en webpack para las transformaciones de browserify y los plugins de RequireJS, es un **cargador (loader)**. Aquí vemos como podemos hacer que webpack cargue soporte para CoffeeScript y JSX+ES6 (debes ejecutar `npm install babel-loader coffee-loader` primero):

Ver también las [instrucciones de instalación babel-loader](https://www.npmjs.com/package/babel-loader) para dependencias adicionales (tl;dr ejecutar `npm install babel-core babel-preset-es2015 babel-preset-react`).

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

Para habilitar requerir archivos sin especificar la extensión, hay que agregar el parámetro `resolve.extensions` declarando que tipos de archivos va a buscar webpack:

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
    // ahora podemos hacer require('file') en vez de require('file.coffee')
    extensions: ['', '.js', '.json', '.coffee']
  }
};
```


## 5. Estilos (CSS) e imágenes

Primero actualizamos el código para incluir contenido estático usando `require()`

```js
require('./bootstrap.css');
require('./myapp.less');

var img = document.createElement('img');
img.src = require('./glyph.png');
```

Cuando requerimos CSS (o less, etc), webpack incluye el CSS en forma de string en una linea dentro del paquete de JS, y `require()` va luego a insertar los tags de estilo `<style>` en la pagina. Cuando requerimos imágenes, webpack incluye una linea en el paquete con la URL de la imagen, y luego la retorna desde el `require()`.

Una vez mas, debemos indicarle a webpack como realizar esto (nuevamente utilizando cargadores)

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    path: './build', // Aquí van las imágenes y JS
    publicPath: 'http://mycdn.com/', // Esta ruta se utiliza para generar las URLs a por ejemplo, las imágenes
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // usar ! para encadenar cargadores
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' } // URLs base64 en linea para imágenes <=8k, URLs directas para el resto
    ]
  }
};
```

## 6. Banderas para funciones

Cuando tenemos código que queremos despachar unicamente a nuestro ambiente de desarrollo (como extra logging) o ambientes de preproducción (como funciones en alpha para testear internamente), debemos usar globales mágicas:

```js
if (__DEV__) {
  console.warn('Extra logging');
}
// ...
if (__PRERELEASE__) {
  mostrarFuncionOculta();
}
```

Y luego informar esas globales mágicas a webpack:

```js
// webpack.config.js

// definePlugin recibe strings crudas y la inyecta, por lo que es posible incluir JS si se desea.
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

Ahora podemos construir usando `BUILD_DEV=1 BUILD_PRERELEASE=1 webpack` desde la consola. Nótese que ya que `webpack -p` ejecuta la función de uglify para eliminar código muerto, cualquier cosa incluida dentro de ese tipo de bloques va a ser eliminado y por ende, no corremos el riesgo de difundir rutas o cogido secreto.

## 7. Múltiples puntos de entrada

Digamos que tenemos una pagina de perfil y una pagina de feed. No queremos que el usuario tenga que descargar el contenido del feed si solo va a visitar el perfil. Entonces creamos múltiples paquetes: creamos un "modulo principal" (llamado punto de entrada) para cada pagina:

```js
// webpack.config.js
module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // La plantilla utiliza los nombres de la entradas definidas arriba
  }
};
```

Para el perfil, insertamos `<script src="build/Profile.js"></script>` en nuestra pagina; y luego lo mismo para el feed.

## 8. Optimizando código en común

El Feed y el Perfil probablemente comparten bastante código (como React u hojas de estilos y componentes en común). webpack es inteligente: puede darse cuenta que cosas tienen en común y crear un paquete compartido que puede ser cacheado entre paginas:

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
    filename: '[name].js' // La plantilla utiliza los nombres de la entradas definidas arriba
  },
  plugins: [commonsPlugin]
};
```

Agregando `<script src="build/common.js"></script>` por encima del tag de script que agregamos en el paso previo, ya podes disfrutar de cachear el código compartido.

## 9. Carga asincrónica

CommonJS es síncrono pero webpack nos provee una forma de especificar dependencias de manera asincrónica. Esto es util para routers desde el lado del cliente, donde queremos el router presente en todas las paginas, pero no queremos descargar funciones y/o contenido hasta que no sean realmente necesarias.

Especificamos el **punto de quiebre** donde queremos cargar de forma asincrónica. Por ejemplo:

```js
if (window.location.pathname === '/feed') {
  showLoadingState();
  require.ensure([], function() { // esta sintaxis es extraña pero funciona
    hideLoadingState();
    require('./feed').show(); // cuando se llama a esta función, webpack garantiza que el modulo sea accesible de forma sincrónica.
  });
} else if (window.location.pathname === '/profile') {
  showLoadingState();
  require.ensure([], function() {
    hideLoadingState();
    require('./profile').show();
  });
}
```

webpack va a realizar el trabajo duro y generar **pedazos (chunks)** y cargarlos por nosotros.

webpack asume que esos archivos están en el directorio madre cuando los cargamos. Podemos usar `output.publicPath` para configurar eso:

```js
// webpack.config.js
output: {
    path: "/home/proj/public/assets", // ruta donde webpack va a construir tus archivos
    publicPath: "/assets/" // ruta que va a ser utilizada a la hora de requerir archivos
}
```

## Recursos adicionales

Para echar un vistazo a un ejemplo del mundo real sobre como un equipo exitoso esta utilizando webpack: http://youtu.be/VkTCL6Nqm6Y
Es Pete Hunt (autor de esta guía) en la OSCon hablando sobre webpack en Instagram.com

## FAQ

### webpack no parece modular

webpack es **extremadamente** modular. Lo que hace grandioso a webpack es que permite que los plugins se inyecten a si mismos en mas puntos durante el proceso de construcción, cuando lo comparamos con las alternativas como browserify y RequireJS. Muchas cosas que parecen parte del núcleo son en realidad simplemente plugins que son cargados por default, y pueden ser anulaos o sobrescritos (por ejemplo, el parseador para require() de CommonJS).
