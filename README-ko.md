# Webpack How to

## 이 가이드의 목표

이 가이드는 webpack으로 원하는 작업을 수행하기 위한 요리책과 같습니다. 인스타그램에서 실제로 사용하고 있는 것들을 망라한 실전적인 내용으로 구성되어 있습니다.

필자로부터의 조언: 우선 이 글을 webpack의 참고자료로서 가까이에 두고 시작합시다. 공식문서는 나중에 좀 더 깊게 이해해야할 필요가 있을 때 확인하도록 하세요.

## 필요한 것들

  * browserify, RequireJS 또는 비슷한 것들을 알고 있을 것
  * 다음과 같은 것들에 가치가 있다고 생각하고 있을 것:
    * 번들 분할
    * 비동기 로딩
    * 이미지나 CSS와 같은 정적인 어셋의 패키징

## 1. 왜 Webpack인가?


  * **Browserify와 비슷한 기능을 제공함**과 동시에 애플리케이션을 복수의 파일로 분할할 수도 있습니다. 만약 SPA에서 여러개의 페이지를 가지고 있는 경우에, 사용자는 보고 있는 페이지의 코드만을 다운로드 받습니다. 만약 사용자들이 다른 페이지로 이동하게 되면, 공통으로 사용하는 코드들은 다시 다운로드 받지 않습니다.

  * **많은 경우, Grunt나 Gulp를 대체할 수 있습니다**. 왜냐하면 Webpack은 스스로 빌드, CSS 번들링, CSS, 압축, JS 유사 언어로부터 JS로의 컴파일, 이미지 관리 등의 많은 작업을 할 수 있기 때문입니다.

다른 모듈 시스템(Angular, ES6) 사이에서 AMD와 CommonJS를 지원합니다. 만약 어떤 것을 사용해야할지 잘 모르겠다면, CommonJS를 사용하세요.

## 2. Browserify 사용자들을 위한 Webpack

다음은 동일한 동작을 수행합니다:

```js
browserify main.js > bundle.js
```

```js
webpack main.js bundle.js
```

하지만 Webpack은 Browserify보다 다양한 기능을 지원하므로, 이러한 처리들을 `webpack.config.js` 파일을 만들어서 좀 더 구조적으로 관리할 수도 있습니다:

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'       
  }
};
```

이는 JS일 뿐이므로, 실제 코드를 마음대로 작성해도 좋습니다.

## 3. Webpack을 실행하기

`webpack.config.js`가 존재하는 폴더에서 다음을 실행하면 됩니다:

  * `webpack` 개발 환경을 기준으로 한번만 빌드합니다.
  * `webpack -p` 실제 환경을 기준으로 한번만 빌드합니다(압축).
  * `webpack --watch` 개발 환경에서 계속해서 차분을 (고속!)빌드합니다.
  * `webpack -d` 소스 맵을 포함합니다.

## 4. JS로 컴파일 되는 언어들

Webpack에서 Browserify의 변환(transform)과 RequireJS 플러그인에 해당하는 것이 **로더**입니다. Webpack에게 CoffeeScript와 페이스북의 JSX+ES6 지원을 추가하는 방법에 대해서 설명해보겠습니다(그 전에 `npm install babel-loader coffee-loader`을 먼저 실행해두어야 합니다).

필요한 추가 의존성에 대해서는 [babel-loader 설치 안내](https://www.npmjs.com/package/babel-loader)를 참고하세요(그조차도 귀찮다면 `npm install babel-core babel-preset-es2015 babel-preset-react`를 실행하세요).

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

확장자를 지정하지 않고 require를 사용하기 위해서는 Webpack이 파일을 찾을 수 있도록 `resolve.extensions`를 추가해야 합니다:

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


## 5. 스타일시트와 이미지

우선 (노드의 `require()`와 동일하게 명명된) 정적 어셋을 `require()`로 처리하기 위해서 코드를 고쳐봅시다:

```js
require('./bootstrap.css');
require('./myapp.less');

var img = document.createElement('img');
img.src = require('./glyph.png');
```

Webpack은 CSS(또는 less 등)을 사용하는 경우에 JS 번들 내부에 CSS를 문자열의 형태로 저장한 뒤, `require()`를 사용해서 `<style>` 태그를 페이지에 삽입합니다. 만일 이미지를 요청한다면, Webpack은 이미지의 URL을 번들에 삽입하고, 나중에 `require()`를 통해서 가져오게 됩니다.

단, Webpack에게 다음의 내용을 알려줄 필요가 있습니다(다시 로더에서):
But you need to teach webpack to do this (again, with loaders):

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    path: './build', // 이곳에 이미지와 JS를 저장합니다
    publicPath: 'http://mycdn.com/', // URL을 생성할 때에 사용합니다
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // 로더를 연결하기 위해서 !를 사용합니다
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' } // 8kb 이하의 이미지는 base64 URL 형태로 직접 삽입됩니다
    ]
  }
};
```

## 6. 기능 플래그

개발 환경이나 도그푸딩(사내에서 테스트하는 미공개 기능 등) 서버에서만 사용하고 싶은 코드(로그 저장 등)가 있을 수 있습니다. 그런 경우에는 다음과 같은 마법 전역 변수를 참조해주세요.

```js
if (__DEV__) {
  console.warn('Extra logging');
}
// ...
if (__PRERELEASE__) {
  showSecretFeature();
}
```

다음으로 Webpack에 그 마법 전역 변수를 전달해 줍시다:

```js
// webpack.config.js

// definePlugin는 문자열을 그대로 인수로 받아서 넘겨주기 때문에 필요하다면 JS 문자열을 그대로 넘길 수도 있습니다.
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

이것으로 콘솔에서 `BUILD_DEV=1 BUILD_PRERELEASE=1 webpack`라는 식으로 빌드할 수 있습니다. `webpack -p`는 사용하지 않는 코드를 제거하기 때문에 이 블록에 감싸진 코드들은 비공개인 기능이나, 개발 환경용의 코드는 외부에 공개되지 않습니다.

## 7. 복수의 엔트리 포인트

프로필 페이지와 피드 페이지가 있다고 가정합니다. 프로필만을 보고 싶어하는 사용자에게는 피드 관련 코드를 다운로드하지 않게끔 하고 싶다고 합시다. 이를 위해서 복수의 번들을 준비해봅시다: 페이지당 하나의 "메인 모듈" (앞으로는 엔트리 포인트라고 부르겠습니다)을 생성해보죠.

```js
// webpack.config.js
module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // 위에서 설정한 엔트리의 키 값에 대응하는 템플릿
  }
};
```

이제 `<script src="build/Profile.js"></script>`를 프로필 페이지에 삽입합니다. 피드를 위해서도 비슷한 작업을 할 수 있을 겁니다.

## 8. 공통 코드의 최적화

피드와 프로필은 많은 공통점(React나 공통으로 사용하는 스타일시트, 그리고 컴포넌트 등)을 가지고 있습니다. Webpack은 각 엔트리간의 공통 부분을 찾을 수 있는 능력이 있으며, 공유할 수 있는 공통의 번들을 생성합니다:

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
    filename: '[name].js' // 위에서 설정한 엔트리의 키 값에 대응하는 템플릿
  },
  plugins: [commonsPlugin]
};
```

`<script src="build/common.js"></script>`를 이전 단계에서 추가한 스크립트 태그의 앞에 추가하여 편하게 캐싱을 사용해주세요.

## 9. 비동기 로딩

CommonJS는 동기적입니다만 Webpack은 비동기적으로 의존 관계를 해결하는 방법도 제공합니다. 이는 클라이언트 쪽의 라우터를 사용하지만, 실제로 필요할 때까지 해당 코드들을 미리 받아두고 싶지 않은 경우에 유용합니다.

비동기 로딩하고 싶은 **분할 포인트**를 지정해주세요. 예를 들어:

```js
if (window.location.pathname === '/feed') {
  showLoadingState();
  require.ensure([], function() { // 이 문법은 이상해 보이지만 동작합니다.
    hideLoadingState();
    require('./feed').show(); // 이 함수가 호출되면 동기적으로 사용할 수 있도록 보장합니다.
  });
} else if (window.location.pathname === '/profile') {
  showLoadingState();
  require.ensure([], function() {
    hideLoadingState();
    require('./profile').show();
  });
}
```

Webpack은 남은 작업을 수행하고, 나머지 **파일 조각**들을 생성하여 불러올 것입니다.

Webpack은 이러한 파일들이 최상위 폴더에 있다고 가정하고, 이를 기준으로 HTML 스크립트 태그에 불러옵니다. 이 경로는 `output.publicPath`를 사용해서 변경할 수 있습니다.

```js
// webpack.config.js
output: {
    path: "/home/proj/public/assets", // Webpack이 생성한 파일들을 저장하는 경로
    publicPath: "/assets/" // 파일을 로드할 때 실제로 존재할 것이라고 생각하는 경로
}
```

## 추가 리소스

실제로 Webpack을 잘 활용하여 성공한 사례를 살펴보세요: http://youtu.be/VkTCL6Nqm6Y

이 영상은 OSCon에서 Pete Hunt가 인스타그램에서 어떻게 Webpack을 활용했는지를 보여줍니다.

## FAQ

### Webpack이 전혀 모듈을 활용하는 것처럼 보이지 않습니다

Webpack은 **무척** 모듈화되어 있습니다. Browserify나 Requirejs와 같은 선택지들과 다른 Webpack의 멋진 점은 플러그인이 자기 자신을 빌드 프로세스 도중에 다양한 장소에 주입할 수 있다는 점입니다. 빌드 시에 중심 부분에 기본적으로 들어가는 많은 것들은 그냥 플러그인이며, 이를 덮어쓸 수도 있습니다(i.e. CommonJS의 require() 파서 등).
