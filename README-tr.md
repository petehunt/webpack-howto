# webpack-howto

## Bu kılavuzun amacı

Bu kıtapçık, webpack ile işlerin nasıl yürüdüğünü gösterir. Instagram'da kullandığımız ve hiç kullanmadığımız birçok şeyi içerir.

Size tavsiyem: başlangıç için bu kılavuzu webpack dökümanı olarak kullanın daha sonra bazı şeyleri netleştirmek için webpack'in resmi dökümanlarına bakın.

## Ön koşullar

  * Browserify, RequireJS veya benzerlerini bilmelisiniz
  * Önemini bilmelisiniz:
    * Kodu parçalara ayırmak (Bundle splitting)
    * Asenkron yükleme (Async loading)
    * Resimler ve CSS dosyaları gibi statik dosyaları paketleme

## 1. Neden webpack?


  * **Browserify'a benziyor** ama uygulamanızı birden çok dosya şeklinde parçalara ayırıyor, bölüyor. Tek sayfalık (single-page) bir uygulamada birden fazla sayfanız varsa, kullanıcı yalnızca bu sayfa için gerekli kodları indirir. Eğer kullanıcı başka bir sayfaya giderse ortak kodu tekrar indirmesine gerek kalmaz.

  * **Genellikle grunt ve gulp yerine geçer** çünkü CSS, işlenmemiş CSS, compile-to-JS dilleri ve resimleri diğer şeylerin arasından bundle ve build edebilir.

Diğer modül sistemleri arasından (Angular, ES6) AMD ve CommonJS'i destekler. Eğer ne kullanacağınızı bilmiyorsanız CommonJS kullanın.

## 2. Browserify kullananlar için Webpack

Bunlar eşdeğerdir:

```js
browserify main.js > bundle.js
```

```js
webpack main.js bundle.js
```

Fakat webpack, Browserify'dan daha güçlüdür. Bu yüzden genellikle işleri organize hale getirmek için `webpack.config.js` oluşturmak isteyebilirsiniz.

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'       
  }
};
```

Normal bir JS dosyası olduğu için içerisine kod yazmakta özgürsünüz.

## 3. Webpack nasıl başlatılır

`webpack.config.js` dosyasının bulunduğu dizine geçin ve aşağıdaki komutları çalıştırın:

  * `webpack` geliştirme süreci için tek seferlik build işlemi
  * `webpack -p` üretim süreci için tek seferlik build işlemi (minification)
  * `webpack --watch` geliştirme sürecinde sürekli devam eden build işlemleri için
  * `webpack -d` kaynak haritalarını (source maps) dahil etmek için

## 4. Compile-to-JS dilleri

**loader** browserify dönüşümlerinin ve RequireJS eklentilerinin webpack'teki karşılığıdır. webpack'e CoffeeScript ve Facebook JSX+ES6 desteğini şu şekilde öğretebilirsiniz (`npm install babel-loader coffee-loader` yapmalısınız):

Ek bağımlılıklar için [babel-loader kurulum talimatlarına](https://www.npmjs.com/package/babel-loader) bakınız (tl;dr run `npm install babel-core babel-preset-es2015 babel-preset-react`).

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

Dosya uzantısı belirtmeden require işlemi yapabilmek için `resolve.extensions` parametresini webpack'in hangi dosyalara bakacağını da belirterek eklemelisiniz.

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
    //artık require('file.coffee') yerine require('file') kullanabilirsiniz
    extensions: ['', '.js', '.json', '.coffee'] 
  }
};
```


## 5. Stylesheets ve resimler

İlk önce kodunuzu statik dosyaları `require()` ile kullanabilmek için update edin:

```js
require('./bootstrap.css');
require('./myapp.less');

var img = document.createElement('img');
img.src = require('./glyph.png');
```

CSS (veya less vb.) dosyasına ihtiyaç duyduğunuz zaman webpack, CSS'i JS bundle içerisinde string olarak sıralar ve `require()` sayfanın içerisine `<style>` tag'i ekler. Resim dosyasına ihtiyaç duyduğunuz zaman webpack, resmin URL'ini bundle içerisinde sıralar ve onu `require()` ile döndürür.

Ama webpack'e bunu nasıl yapacağını öğretmeniz gerekir (yine loaders ile):

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    path: './build', // Resim ve js dosyalarının gideceği yer
    publicPath: 'http://mycdn.com/', // Mesela resimlere URL oluşturmak için kullanılır
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // zincirlemek için ! kullanın
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' } // <=8k resimler için base64 URL'leri sıralar, geri kalanlar için URL'leri yönlendirir
    ]
  }
};
```

## 6. Bayrakların (flag) özellikleri

Kodu geliştirme süreci ortamları (loglama gibi) ve test sürümü sunucularımız (yayınlanmamış özellikleri çalışanların test etmesi gibi) için sınırlandırmak istiyoruz. Kodunuzda sihirli globallere başvurun.

```js
if (__DEV__) {
  console.warn('Ekstra log');
}
// ...
if (__PRERELEASE__) {
  showSecretFeature();
}
```

Daha sonra webpack'e bu sihirli globalleri öğretin:

```js
// webpack.config.js

// definePlugin ham string'leri alır ve ekler, böylece eğer isterseniz JS string'leri yerleştirebilirsiniz.
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

Sonra `BUILD_DEV=1 BUILD_PRERELEASE=1 webpack` ile konsoldan build işlemini gerçekleştirebilirsiniz. Şunu unutmayın `webpack -p` uglify ve dead-code eliminasyonu olduğu için bloklarda saklanan gizli string değerleri dışarı sızdırılmamış olacak.

## 7. Çoklu giriş noktası

Farz edelim ki profile ve feed sayfanız var. Eğer kullanıcı yalnızca profile sayfasını istiyorsa feed sayfası için gerekli olan kodları indirmesini istemezsiniz. Bu yüzden birden çok bundle yapın: her sayfa için bir tane "main module" (giriş noktası) oluşturun:

```js
// webpack.config.js
module.exports = {
  entry: {
    Profile: './profile.js',
    Feed: './feed.js'
  },
  output: {
    path: 'build',
    filename: '[name].js' // Yukarıdaki girdideki anahtarlara dayalı şablon
  }
};
```

Profile için sayfanıza `<script src="build/Profile.js"></script>` ekleyin. Feed sayfası içinde benzer bir şey yapın.

## 8. Ortak kod optimizasyonu

Feed ve profile sayfalarının birçok ortak kodu var (React ve ortak stylesheet ve bileşenler gibi). webpack ortak noktalarını çözümleyebilir ve sayfalar arası önbellekte tutulan bir bundle (shared bundle) oluşturabilir:

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
    filename: '[name].js' // Yukarıdaki girdideki anahtarlara dayalı şablon
  },
  plugins: [commonsPlugin]
};
```

Bir önceki adımda eklediğiniz script tag'inden önce `<script src="build/common.js"></script>` ekleyin ve kılınızı kıpırdatmadan önbellek kullanmanın tadını çıkarın.

## 9. Asenkron yükleme

CommonJS senkrondur ama webpack ile asenkron olarak bağımlılıkları tanımlamak mümkündür. Bu, her sayfada yönlendirici (router) olmasını istediğiniz client-side yönlendiriciler için kullanışlıdır ama bu özellikleri ihtiyacınız olana kadar indirmek zorun kalmak istemezsiniz.

Asenkron olarak yüklemek istediğiniz **bölünme noktası** tanımlayın.

```js
if (window.location.pathname === '/feed') {
  showLoadingState();
  require.ensure([], function() { // bu sentaks garip ama işe yarıyor
    hideLoadingState();
    require('./feed').show(); // bu fonksiyon çağırıldığında modül'ün senkron olması garantiye alınır.
  });
} else if (window.location.pathname === '/profile') {
  showLoadingState();
  require.ensure([], function() {
    hideLoadingState();
    require('./profile').show();
  });
}
```

webpack geri kalanını sizin için yapacak, ekstra **yığın** dosyaları oluşturacak ve bunları sizin için yükleyecek.

```js
// webpack.config.js
output: {
    path: "/home/proj/public/assets", //webpack'in build yapacağı yol
    publicPath: "/assets/" //require işlemi yapılırken kullanılacak yol
}
```

## Ek kaynaklar

Başarılı bir takımın webpack'i nasıl kullandığını gösteren gerçek bir örneğe göz atın: http://youtu.be/VkTCL6Nqm6Y
Bu, Pete Hunt'ın Instagram.com'daki webpack ile ilgili OSCon'daki konuşmasıdır.

## SSS

### webpack pek modüler değil gibi

webpack, **son derece** modülerdir. webpack'i harika yapan şey, browserify ve requirejs gibi diğer alternatifleriyle karşılaştırıldığında, eklentilerin build işlemi sırasında daha fazla yere enjekte edilmesine izin vermesidir. Çekirdeğe build edilmiş gibi gözüken çoğu şey aslında varsayılan eklentilerdir ve override edilebilir (yani CommonJS require() parser).
