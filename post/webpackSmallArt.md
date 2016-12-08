# webpack.config.jsに関する知見、5選

> 休日を粉砕して手に入れた知見です

勤労感謝の日の前日の29時までと当日の27時までの時間を使って[rxon/rxon.github.io](https://github.com/rxon/rxon.github.io)のタスクランナーをgulpからwebpack + npm run-scriptに書き換える作業を行い、そこそこの知見が得られたので書く。

## extract-text-webpack-plugin

webpackではモジュールとして読み込んだCSSを`<head>`にをあとからjsで流し込むという方式を取っているが、performanceの面であんまりよろしくない気がしたので外部ファイル化する [webpack/extract-text-webpack-plugin](https://github.com/webpack/extract-text-webpack-plugin)を使用した。

```javascript
module: {
  loaders: [{
    test: /\.css$/,
    exclude: /node_modules/,
    loader: ExtractText.extract('style-loader', 'css-loader!postcss-loader')
  }]
}
```

というように書けば動くのだが、何も考えずloaderにchain loadersをつかって`style-loader!css-loader!postcss-loader`とか指定すると`ReferenceError: window is not defind`と吐き出され睡眠時間が削れて **「ステラのまほう」第8話「デバッグなめたらダメだよ？」** ってかんじになる。

## devtool: 'eval'

source-map作るための設定。`eval`って値を使うとbabel後みたいなコードが出てくるが、performanceが+++になる。 See also:[webpack configuration](http://webpack.github.io/docs/configuration.html#devtool)

## PostCSS

もともと業界最小記述量のstylusの中でPostCSSを使い、トランパイルしてからトランスパイルしていた。前からPostCSS内でstylusみたいな立ち位置にあるSugarSSの採用を考えていたが最近生CSSが書きたくなってきたので、今回はsyntax系のプラグインは使っていない。

プラグインの読み込みのとき、postcss-loaderのREADMEには`postcss.config.js`を使えと書いてあるが普通に`webpack.config.js`に下記のようなコードを書いたほうがいい。

```javascript
postcss: [
  require('postcss-import'),
  require('postcss-custom-properties'),
  require('postcss-custom-media'),
  autoprefixer({
    browsers: ['last 2 versions']
  }),
  require('cssnano')
]
```

PostCSSのデバッグがなかなか曲者で、どれも静かに失敗する。原因は処理の順番で、上のように`ファイル操作 → 変数処理 → prefix → 圧縮`という順番にする。ファイル操作が一番初めというのがミソ。

- **postcss-import** : 依存を解決する。npmからもimportできる
- **postcss-custom-properties** : 変数を使えるようにする。W3C specificationsにのっとっているので、プロパティの値でしか使えない
- **postcss-custom-media** : エディアクエリでも変数を使えるようにする
- **autoprefixer** : 例のやつ
- **cssnano** : よしな圧縮マン

postcss-importに関しては、[sebastian-software/postcss-smart-import](https://github.com/sebastian-software/postcss-smart-import)というのも良さそうだったけどとりあえず間に合ってたので保留。

## タスクの分離

ただでさえcomplicatedなのでCSSとJSのトランスパイルをwebpackで、そのほかはnpm run-scriptでというように分離した。こんな感じ。

```json
"scripts": {
  "start": "cp src/index.html public/index.html && webpack-dev-server --open --inline --hot --content-base public/",
  "build": "webpack -p && critical src/index.html --inline --minify --base public/ > public/index.html",
  "deploy": "npm run build && gh-pages -d public/ --branch master",
  "test": "stylelint src/css/*.css && xo src/js/*.js"
}
```

良いかんじ。

- **cp** : ちょっとshellで試したらめっちゃ速くてびびったので、そのまま使った。実際はshelljsのcli版の[shelljs/shx](https://github.com/shelljs/shx)とか使ったほうがいいんだろうけど
- **webpack-dev-server** : 公式docによると
- **critical** : critical-path CSSを作ってinlineまでする
- **gh-pages** : cliでgh-pagesにdeploy
- **stylelint** : PostCSSのCSS linter
- **xo** : 設定済みのESlint的なもの

## そのほか色々

- [FormidableLabs/webpack-dashboard](https://github.com/FormidableLabs/webpack-dashboard)、使ってみたい感ある。
- vwの挙動がとても謎。100vwにすると100％＋5pxぐらいになって横スクロール。
- jsの実行タイミング、最初はDOM treeが完成した時点で実行する`$(document).ready`を使っていたが、これだとローディングアニメーションをするときに処理されていなくて実行されず、バチッと消えるのですべてのリソースがロードされてから実行する`window.onload`を使った。
- ライブラリーをちょっとずつ追加しているようなとき、とくにwebpack環境構築時はいちいち`yarn add hoge`すると時間がかかるので、追加するときは`npm i hoge`したほうがいい。
- [cross-platform-yu-gothic](https://www.npmjs.com/package/cross-platform-yu-gothic)いいかんじ。
- やっぱりある程度の効率で作業ができるのは27時まで。
