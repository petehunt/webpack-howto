# webpack-howto

## Στόχος για αυτόν τον οδηγό

Αυτό είναι ένα σύνολο συμβουλών για το πως να κάνετε πράγματα με το webpack. Επίσης περιλαμβάνει μόνο πράγματα που χρησιμοποιούμε στο Instagram.

Η συμβουλή μου: ξεκινείστε με αυτό ως webpack docs και μετά κοιτάξτε τα επίσημα docs.

## Προαπαιτούμενα

  * Ξέρετε browserify, RequireJS ή κάτι παρόμοιο
  * Βλέπετε τα θετικά των:
    * Bundle splitting
    * Async loading
    * Packaging static assets όπως εικόνες και CSS

## 1. Γιατί webpack?


  * **Είναι σαν το browserify**, αλλά μπορεί να χωρίσει την εφαρμογή σας σε πολλαπλά αρχεία. Αν έχετε πολλαπλές σελίδες σε μια μονοσέλιδη εφαρμογή, ο χρήστης κατεβάζει κώδικα μόνο για αυτή τη σελίδα. Αν πάνε σε άλλη σελίδα, δεν ξανακατεβάζουν τον κοινό κώδικα.

  * **Συχνά αντικαθιστά το grunt ή το gulp** γιατί μπορεί να χτίσει και να δεσμεύσει CSS, preprocessed CSS, compile-to-JS γλώσσες και εικόνες μέσα σε άλλα πράγματα.

Υποστηρίζει AMD και CommonJS, όπως και άλλα module systems (Angular, ES6). Αν δεν ξέρετε τι να χρησιμοποιήσετε, χρησιμοποιήστε CommonJS.

## 2. Webpack για ανθρώπους με γνώσεις στο Browserify

Αυτά είναι αντίστοιχα:

```js
browserify main.js > bundle.js
```

```js
webpack main.js bundle.js
```

Ωστόσο, το webpack είναι πιο δυνατό από το Browserify, οπότε γενικά θέλετε να κάνετε ένα `webpack.config.js` για να έχετε τα πράγματά σας οργανωμένα:

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    filename: 'bundle.js'       
  }
};
```

Αυτό είναι απλά JS, οπότε μπορείτε να βάλετε κανονικό κώδικα εκεί μέσα.

## 3. Πως να χρησιμοποιείτε το webpack

Πηγαίντε στο directory που περιέχει το `webpack.config.js` και τρέξτε:

  * `webpack` για να χτίζετε μια φορά για τον προγραμματισμό
  * `webpack -p` για να χτίζετε μια φορά για παραγωγή (minification)
  * `webpack --watch` για συνεχή σταδιακή ανάπτυξη (γρήγορο!)
  * `webpack -d` για να περιλαμβάνετε και τα source maps

## 4. Compile-to-JS γλώσσες

Τα αντίστοιχα transforms του browserify και τα plugins για το RequireJS είναι τα **loader**. Ορίστε πως μπορείτε να μάθετε στο webpack πως να φορτώνει CoffeeScript και το JSX+ES6 του Facebook (πρέπει να τρέξετε `npm install babel-loader coffee-loader`):

Κοιτάξτε επίσης το [babel-loader installation instructions](https://www.npmjs.com/package/babel-loader) για επιπλέον dependencies (tl;dr τρέξτε `npm install babel-core babel-preset-es2015 babel-preset-react`).

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

Για να ενεργοποιήσετε απαιτούμενα αρχεία χωρίς να προσδιορίζετε το extension, πρέπει να προσθέσετε μια `resolve.extensions` παράμετρο προσδιορίζοντας ποια αρχεία να ψάξει το webpack:

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
    // μπορείτε πλεον να κάνετε require('file') αντί για require('file.coffee')
    extensions: ['', '.js', '.json', '.coffee']
  }
};
```


## 5. Stylesheets και εικόνες

Πρώτα ανανεώστε τον κώδικά σας για να κάνετε `require()` τα στατικά assets (ονομασμένα όπως θα ήταν με το `require()` του node):

```js
require('./bootstrap.css');
require('./myapp.less');

var img = document.createElement('img');
img.src = require('./glyph.png');
```

Όταν κάνετε require CSS (ή less, κλπ.), το webpack κάνει inline το CSS ως string μέσα στο JS bundle και το `require()` θα εισάγει ένα `<style>` tag στην σελίδα. Όταν κάνετε require εικόνες, το webpack κάνει inline ένα URL στην εικόνα μέσα στο bundle και το επιστρέφει απο το `require()`.

Αλλά πρέπει να μάθετε το webpack να το κάνει αυτό (ξανά, με loaders):

```js
// webpack.config.js
module.exports = {
  entry: './main.js',
  output: {
    path: './build', // Εδώ θα πάνε οι εικόνες ΚΑΙ η js
    publicPath: 'http://mycdn.com/', // Αυτό χρησιμοποιείται για να δημιουργεί URLs σε π.χ. εικόνες
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /\.less$/, loader: 'style-loader!css-loader!less-loader' }, // χρησιμοποιείτε ! για να κάνετε chain τους loaders
      { test: /\.css$/, loader: 'style-loader!css-loader' },
      { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192' } // inline base64 URLs για <=8k εικόνες, κατ' ευθείαν URLs για τα υπόλοιπα
    ]
  }
};
```

## 6. Feature flags

Έχουμε κώδικα που θέλουμε να κάνουμε gate μόνο στο dev περιβάλλον μας (όπως το logging) και τα εσωτερικά dogfooding servers (όπως unreleased features που τεστάρουμε). Στον κώδικά σας αναφέρονται ως magic globals:

```js
if (__DEV__) {
  console.warn('Extra logging');
}
// ...
if (__PRERELEASE__) {
  showSecretFeature();
}
```

Μετά μάθετε το webpack αυτά τα magic globals:

```js
// webpack.config.js

// definePlugin παίρνει strings και τα βάζει, οπότε μπορείτε να βάλετε JS strings αν θέλετε.
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

Μετά μπορείτε να χτίσετε με `BUILD_DEV=1 BUILD_PRERELEASE=1 webpack` από το console. Σημειώστε πως αφού το `webpack -p` τρέχει το uglify, οτιδήποτε μέσα σε κάποιο από αυτά τα blocks θα το πετάξει έξω, οπότε δεν θα φανερωθούν μυστικά features ή strings.

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
