# webpack-howto

## Objetivo deste guia

Este é um manual de como trabalhar com o webpack. Ele inclui a maioria das coisas que usamos no Instagram e nada do que não usamos.

Meu conselho: comece com este manual como uma documentação para webpack, depois leia a documentação oficial para esclarecimentos.

## Pré-requisitos

  * Conhecer browserify, RequireJS ou algo similar
  * Você valoriza:
    * Divisão de pacotes (Bundle splitting)
    * Carregamento assíncrono (Async loading)
    * Empacotamento de conteúdo estático como imagens e CSS

## 1. Por que webpack?

  * **É como o browserify**, mas pode dividir sua aplicação em múltiplos arquivos. Se você tem multiplas páginas em uma aplicação "single-page", o usuário baixa somente código para aquela página. Se ele vai para qualquer outra, ele não baixa novamente o código em comum.

  * **Frequentemente substitui grunt ou gulp** porque ele pode construir, empacotar e preprocessar CSS, compilar para linguages JavaScript e imagens, entre outras coisas.

Suporta AMD (Definição de Módulos Assíncrono) e CommonJS, entre outros sistemas de módulo (Angular, ES6). Se você não sabe o qual usar, use CommonJS.

## 2. Webpack para usuários de Browserify

Estes são equivalentes:

```js
browserify main.js > bundle.js
```

```js
webpack main.js bundle.js
```

Entretanto, webpack é mais podereoso que Browserify, então em geral vai precisar de um arquivo `webpack.config.js` para manter as coisas organizadas:

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'       
  }
};
```

Isto é apenas JS, então sinta-se à vontade para colocar código real lá.

## 3. Como utilizar o webpack

Vá para o diretório aonde está localizado o `webpack.config.js` e execute:

  * `webpack` para construir uma vez para desenvolvimento
  * `webpack -p` para construir uma vez para produção (minificação)
  * `webpack --watch` para construção contínua em desenvolvimento (rápido!)
  * `webpack -d` para incluir mapas de fonte

## 4. Compilar para linguagens JS

O equivalente às transformações do browserify e plugins do RequireJS é um **loader**. Aqui é um exemplo de como você pode configurar o webpack para carregar CoffeeScript e suporte ao JSX+ES6 do Facebook (você deve rodar `npm install babel-loader coffee-loader`):

Veja também [instruções de instalação do babel-loader](https://www.npmjs.com/package/babel-loader) (em inglês) para dependências adicionais (**tl;dr** execute `npm install babel-core babel-preset-es2015 babel-preset-react`).

>NOTA: 'tl;dr' em inglês é uma abreviação para "muito longo, não li tudo"

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

Para habilitar arquivos requeridos sem especificar a extensão você deve adicionar o parâmetro `resolve.extensions` especificando o tipo de arquivo que o webpack deve localizar:

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


## 5. Estilos e imagens

Primeiro atualize o seu código para usar `require()` em seu conteúdo estático (nomeado como devem com o `require()` do node):

```js
require('./bootstrap.css');
require('./myapp.less');

var img = document.createElement('img');
img.src = require('./glyph.png');
```

Quando você solicita CSS (ou less, etc), o webpack alinha o CSS como texto dentro do pacote JS e `require()` insere uma tag `<style>` na página. Quando você solicita imagens, o webpack alinha uma URL à imagem dentro do pacote e retorna esta a partir do `require()`.

Mas você precisa configurar o webpack para fazer isso (novamente, com loaders):

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    path: './build', // Aqui é onde as imagens JUNTO COM OS js vão
    publicPath: 'http://mycdn.com/', // Isto é utilizado para gerar URLs para - por exemplo imagens
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // use ! para encadear loaders 
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' } // alinhe URLs com imagens base64 para aquelas com <=8k de tamanho, URL direta para as demais
    ]
  }
};
```

## 6. Flags de Recursos

Nós codificamos apenas o que queremos para nosso ambiente de desenvolvimento (como log) e nosso servidor interno (para testar recursos ainda não liberados com a equipe interna). No nosso código, atribuimos aos globais: 

```js
if (__DEV__) {
  console.warn('Extra logging');
}
// ...
if (__PRERELEASE__) {
  showSecretFeature();
}
```

Então ensinamos o webpack para usar estes globais mágicos:

```js
// webpack.config.js

// definePlugin pega texto cru e os insere, então você pode colocar textos JS se quiser.
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

Então você pode construir com `BUILD_DEV=1 BUILD_PRERELEASE=1 webpack` pelo console. Perceba que desde que `webpack -p` executa uglify e elimanção de código inútil, tudo que é empacotado em um desses blocos será descartado, então você não irá vazar recursos secretos ou outros textos.

## 7. Múltiplos pontos de entrada

Digamos que você tem uma página de perfil e uma página de feeds. Você não vai querer que o usuário baixe código do feed se ele só quiser ver a página de perfil. Então faça múltiplos pacotes: crie um "módulo principal" (chamado de ponto de entrada) por página:

```js
// webpack.config.js
module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // Template baseado em chaves na entrada acima
  }
};
```

Para o perfil, insira `<script src="build/Profile.js"></script>` na sua página. Faça algo similar para o feed.

## 8. Otimizando código comum

A página de feed e do perfil compartilham muita coisa em comum (como o React e estilos e componentes em comum). O webpack pode descobrir o que eles têm em comum e fazer um pacote compartilhado que pode ser cacheado entre as páginas:

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
    filename: '[name].js' // Template baseado em chaves na entrada acima
  },
  plugins: [commonsPlugin]
};
```

Adicione `<script src="build/common.js"></script>` antes da script tag que você adicionou no passo anterior e desfrute do cache livre.

## 9. Carregamento assíncrono

CommonJS é síncrono porém o webpack disponibiliza um jeito para especificar dependências de maneira assíncrona. Isto é útil para roteadores do lado do cliente, onde você quer rota em cada página, mas você não quer baixar recursos até precisar deles. 

Especifique o **split point** (ponto de divisão) onde você deseja carregar de maneira assíncrona. Por exemplo:

```js
if (window.location.pathname === '/feed') {
  showLoadingState();
  require.ensure([], function() { // esta sintaxe é estranha mas funciona
    hideLoadingState();
    require('./feed').show(); // quando esta função é chamada, o módulo é garantido para ser disponível de maneira assíncrona.
  });
} else if (window.location.pathname === '/profile') {
  showLoadingState();
  require.ensure([], function() {
    hideLoadingState();
    require('./profile').show();
  });
}
```

O webpack fará o resto e gera arquivos **chunck** (de pedaço) extra depois os carrega para você.

O webpack irá assumir que aqueles arquivos estarão no seu diretório raiz (root) quando você os carregar dentro de um script tag no html por exemplo. Você pode usar `output.publicPath` para configurar isso. 

```js
// webpack.config.js
output: {
    path: "/home/proj/public/assets", //caminho para onde o webpack vai construir suas coisas
    publicPath: "/assets/" //caminho que será considerado quando requisitar seus arquivos
}
```

## Recursos adicionais

Dê uma olhada em exemplos do mundo real de como equipes de sucesso estão alavancando o webpack:  http://youtu.be/VkTCL6Nqm6Y.
Este é Pete Hunt na OSCon falando sobre o webpack no Instagram.com

## FAQ

### webpack não parece modular

O webpack é **extremamente** modular. O que faz o webpack ótimo é que ele permite que plugins se injetem em mais locais no processo de construção quando comparados com alternativas como browserify e requirejs. Muitas coisas que parecem construídas no núcleo são apenas plugins que são carregados por padrão e podem ser sobescritos (exemplo: o parser require() do CommonJS).