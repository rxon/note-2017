# 游ゴシックを一瞬でクロスプラットフォームにするたったひとつの方法

<time datetime="2016-12-17">2016-12-17</time>

> これはステマポエムです

時は2013年、かつてないほど美しく汎用性の高いフォントが二大OSにバンドルされることとなった。

その名は、游書体。

いままでMac、Windows両方のOSに同じデフォルトフォントは入っていなかっただけに、フォント指定におけるシルバーブレットになるかと思われた。

しかしMacとWindowsの游書体はPostscript nameと搭載ウェイトが異なり、Web開発者にはMacユーザーが多いためこの事に気づかずWindowsユーザーを中心に「游ゴシック見づらい」というインプレッションが広まった。

その後現在に至るまでこの差異を埋めるための`font-family`、`@font-face`指定を紹介する記事がReact入門記事並みに大量生産された。

[モダン日本語フォント指定 // Speaker Deck](https://speakerdeck.com/tacamy/modanri-ben-yu-huontozhi-ding)もその1つである。

![游ゴシック用のfont-faceが大量に書かれている](img/yu-font-face.png)

このスライドを見てるうちに「これ、まとめてモジュール化しておいたらもう同じこと毎回書かなくてすむし、読みやすくなってユーザーのUXが向上して世界平和につながるのではないか」という感情が膨れ上がったため、CSSライブラリを作った。

その名も、[cross-platform-yu-gothic](https://www.npmjs.com/package/cross-platform-yu-gothic)。

cross-platform-yu-gothicはnpmから`npm i -S cross-platform-yu-gothic`して、 [postcss/postcss-import](https://github.com/postcss/postcss-import)で読み込むことを想定しているが、GitHubの[cross-platform-yu-gothic.css](https://raw.githubusercontent.com/rxon/cross-platform-yu-gothic/master/cross-platform-yu-gothic.css)から直接コピペしても使える。`font-family: cross-platform-yu-gothic, sans-serif;`と書けばプラットフォーム間の差異をかんたんに埋めることができる。

良きタイポグラフィーライフを！
