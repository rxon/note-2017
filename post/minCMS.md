# 世界最小のCMS

<time datetime="2017-03-09">2017-03-09</time>

> ミニマムがベストでジャスティス

この一年間で、Web applicationとCSSライブラリ、Web siteなど幾つかのものを製作した。今回はそのうちの1つである[rxon/note-2017](https://github.com/rxon/note-2017)のバックエンドを取り上げる。今回製作したものも、ごく一部の簡単な文法を工夫して作ったミニマムなものである。

## CMSとは

CMSはContent Management Systemの略で、コンテンツがあればWebに関する知識がなくてもサイトの公開、更新ができるシステムを指す。しかし、この定義だと今回の製作物が含まれないためコンテンツがあればサイトを公開、更新できるシステムを広義のCMSと呼ぶことにする。

## これまでの道のり

これまで、幾つかのCMSを使った。幾つか書き記しておく。なお感想は素人でほとんど知識がなかった時のもので、今の感情とは異なる場合がある。

### WordPress

PHPで書かれた世界シェア27.5％([w3techs.com](http://w3techs.com/)調べ、2017/2現在）のCMS。普段インターネットを見ていてもかなり目にする。管理画面の機能が豊富で、pluginが星の数ほどある。利用者から見るとなかなかいいものだが、自分でいじろうとすると苦しい。

複雑怪奇なファイル階層とデフォルトでjsの読み込みが403になる謎なパーミッション設計に苛まれた。サーバー上でのCSS操作はネタ感があったのでMAMPなるMacでよく使われているらしいローカルサーバーを使ってみたが、設定が最高に面倒だった。

ただ、一番の問題点はやっぱり重いということだろう。Pjaxとキャッシュ使ってできるだけ軽量化している人のサイトでも、やっぱり動的ページの宿命というか重いことは重い。これは個人的な感想だが、WordPressで作られているページはどれもWordPressの匂いがする。UIとかページの構造が同じだからだろうか、やっぱりサイトをみて、「あっWordPressだ！」となるのはあまり好きじゃない。ここら辺からハンバーガーアイコンが嫌いになった。

ここでWordPressは諦めた（嫌いになった）（異論は認める）

### Tumblr

デザイナーとか絵師、写真家も結構使ってるTumbler。Tumblr独自のテンプレートエンジンを使っている。一枚のHTMLにすべての要素を入れ、パーツごとにタグ（`{block:Posts}`とか）で囲み自動で記事を生成する仕組み。アップロードできるのはHTMLだけで他のCSSとかJSは外から持ってくる。Tumblrはプラットフォームとして柔軟で結構ニッチなメディアとして使われることが多い。

ただ結局はTumblrの仕様の上で全てを完結しなければならず、実際にガシガシ作りこみたい場合には物足りなくなる。自前でホストしたくなる。

### 静的サイトジェネレーター

ここまで説明したのは全て動的ページといい、サーバーに対してリクエストがある度にdbから情報を取り、テンプレートに流し込んでHTMLを返す仕組みである。それに対し、あらかじめテンプレートとコンテンツ（主にmarkdown）から生成したHTMLファイルをホストしたものを静的ページといい、この生成のためのツールを静的サイトジェネレーター(static site generator)という。

パフォーマンス、セキュリティ面において動的ページに勝るため企業での採用事例も複数あるほか、サーバーの要件が減るため選択肢が広がり、周りのWeb系の人でも自作の場合はかなりの割合でstatic site generatorを使っている。昨今のトレンドと言えるかもしれない。

静的サイトジェネレーターにもいろいろあるが、自分はbuild速度とドキュメントの充実度でHugoを選んだ。

しばらく使っているうちに、以下の問題点を感じるようになった（static site generatorに関するもののみ記述）

- markdownを拡張して、タイトル、日付、タグなどのメタデータをfront matterとして書き込んでいるが、コンテンツとメタデータがかぶることが多く冗長
- templateのファイル数がどうしても多くなる仕様になっている
- markdownを書き、buildしてdeployするので、手数が多い

ということで「ぼくのかんがえるさいきょうのCMS」を作る旅に出ることにした。

## 世界最小のCMS

### Philosophy

- 様々なものをそぎ落とし、minimumを追求するとwebサイトはコンテンツのlistがあるページと、その下位にあるコンテンツページで構成されていると言える。今回はmarkdownを扱うのでコンテンツのリストアップとその表示のみを行う。

- ワンコマンドでデプロイするだけで完結するようにする。

### Inspiration

[zeit/serve](https://github.com/zeit/serve)という、フォルダーをそのままリストアップして、serveするcli toolを見て、コンテンツディレクトリをファイルシステムでストレージとして扱えるのではとひらめいた。[zeit/serve render.js#L22](https://github.com/zeit/serve/blob/d780f2327c7e5109e537611c7f7f2d9fc7958026/lib/render.js#L22)により、fs.readdirでディレクトリのファイル一覧が取得できることがわかった。

### Code

ここでは、幾つかの主要な関数などを解説する。Node.jsで書き、フレームワークにexpressを使用した。紙面の都合上、省略した箇所がある（エラー処理など）。

```javascript
function getPostInfo(mdName, withHtml) {
  return new Promise((resolve, reject) => {
    fs.readFile(config.mdDir + mdName, 'utf-8', (md) => {
      const postTitle = md.match(/^#\s(.)+\n/)[0].match(/[^#\n\s]+/);
      const postDescription = md.match(/\n>(.)+\n/)[0].match(/[^>\n\s]+/);
      const postDate = md.match(/\d{4}-\d{2}-\d{2}/);

      resolve({
        title: postTitle[0],
        description: postDescription[0],
        date: postDate[0],
        url: mdName,
        html: (withHtml) ? marked(md) : null
      });
    });
  });
}
```

markdownファイルから情報を読み込む関数。markdownをhtmlにcompileするだけでなく、markdownから正規表現を使ってtitleは`#`、descriptionは最初の`>`、日付は`<time>`からメタ情報を抽出している。戻り値としてメタ情報とコンテンツを返す。ある程度フォーマットが固定されるが、かぶりがなくなった。

```javascript
async function getSortedPostsInfo() {
  const mdFiles = await fs.readdir(config.mdDir);
  const postInfo = mdFiles.map(mdFile => getPostInfo(mdFile, false));
  const postsInfo = await Promise.all(postInfo);

  return _.sortBy(postsInfo, ['date', 'title']).reverse();
}
```

ルートにアクセスがあると、`fs.readdir`でファイルをリストアップし、Promiseを返す`getPostInfo()`でそれぞれの情報を取得。日付、タイトルの順でソートする。

非同期処理を同期処理のように書けるES7の`async/await`記法を使っている。非同期処理につきまとう可読性の低さや、処理の見通しの悪さを劇的に改善できる。node v7.6.0からflag(`--harmony-async-await`)なしで動くようになった。

```
app.get('/:post.md', (req, res) => {
  const file = path.format({
    name: req.params.post,
    ext: '.md'
  });
```

個々のコンテンツページに対するルーティング。経験上`/post/`のようにディレクトリを増やすとSEO上マイナスになるので、ルート直下に置きつつ他のファイルと競合しないようにした。あたかもmdファイルがあるかのようなルーティングはリソースを表すURLという思想に則っていない気もしたが、GitHubが思いっきり`.md`でhtmlを返していたのでよしとした。

```javascript
try {
  fs.statSync(config.mdDir + file);
} catch (err) {
  if (err.code === 'ENOENT') {
    res.status(404).send('Sorry, we cannot find that!');
  }
}
```

markdownファイルの404判定はファイルの情報を読む`fs.stat`の同期版を`try...catch`文で包んで行った。`try...catch`文は、コストが高いと言われたり、Goto文と揶揄されたりしているが昨今よく見かけていたので試しに使ってみた。

### Template

取得した値を流し込むtemplateはmustacheを使った。あまりシェアは大きくないが、Logic-less templatesと謳っているだけあり、とても単純な文法を持っている。反復データを命令文なしで展開できるなど、まさに雰囲気でかけるtemplateだ。いろんな言語の実装も用意されている。

### Lint

日本語の文章校正をするため、textlintを使った。プラガブルなlinterで、pluginを組み合わせながら使う。headerの階層チェック、リンクの有効性、冗長な表現の禁止、JTF日本語標準スタイルの文法、技術用語のスペルチェックなどを行った。`.textlintrc`に設定が書けるので、コンフリを直したり細かい定義をした。

結構しっかり書いたのでgistに投げた。[技術文書用textlint設定](https://gist.github.com/rxon/f2a17c81da0901543d987cbd69945d34)

JavaScriptのlintは[sindresorhus/xo](https://github.com/sindresorhus/xo)を使った。良き。

### Test

mocha & supertestで、unitテストと、ルーティングのテストをした。簡単にしか書かなかったがかなりいい感触で、TDDのモチベーションが湧いてきた。reporterはかのnyanを使った。

### Deploy

ホスティングサービスは[now](https://zeit.co/now)を使った。deployがとにかく速く、アップロード最適化に依存ライブラリのsemver aware cachingが相まって、ものの数秒で完了する。スペック的にも個人利用の範囲では最強のホスティングサービスと言える。

## 感情

実感したのは、ミニマムがベストでジャスティスということである。

今回は生CSSと（ほぼ）生HTMLと生markdownを久しぶりに書いたが、精神衛生上とてもよかった。できるだけ生言語を書き、必要に応じて拡張（PostCSSとか）していきたい。
