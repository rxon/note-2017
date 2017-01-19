'use strict';

const path = require('path');

const express = require('express');
const hljs = require('highlight.js');
const _ = require('lodash');
const marked = require('marked');
const morgan = require('morgan');
const mustache = require('mustache');
const fs = require('mz/fs');

const app = module.exports = express();
const siteUrl = 'https://rxon.now.sh/';
const config = {
  mdDir: path.join(__dirname, '/post/'),
  staticDir: path.join(__dirname, '/public/')
};

app.engine('mustache', (filePath, options, callback) => {
  fs.readFile(filePath, 'utf-8', (err, content) => {
    if (err) {
      return callback(new Error(err));
    }
    const rendered = mustache.render(content, options);
    return callback(null, rendered);
  });
});

app.set('view engine', 'mustache');
app.set('views', __dirname);

app.use(express.static(config.staticDir));
app.use(morgan('dev'));

function getPostInfo(mdName, withHtml) {
  return new Promise((resolve, reject) => {
    fs.readFile(config.mdDir + mdName, 'utf-8', (err, md) => {
      if (err) {
        return reject(err);
      }

      const postTitle = md.match(/^#\s(.)+\n/)[0].match(/[^#\n\s]+/);
      const postDescription = md.match(/\n>(.)+\n/)[0].match(/[^>\n\s]+/);
      const postDate = md.match(/\d{4}-\d{2}-\d{2}/);

      marked.setOptions({
        gfm: true,
        highlight(code) {
          return hljs.highlightAuto(code).value;
        }
      });

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

app.get('/', (req, res) => {
  async function sortedPostsInfo() {
    const mdFiles = await fs.readdir(config.mdDir);
    const postsInfo = await Promise.all(mdFiles.map(mdFile => {
      return getPostInfo(mdFile, false);
    }));

    return _.sortBy(postsInfo, ['date', 'title']).reverse();
  }

  sortedPostsInfo().then(sortedPostsInfo => {
    res.render('template', {
      head: {
        title: 'note - rxon\'s miniminimal tech blog - rxon.now.sh',
        url: 'rxon.now.sh',
        description: '読む人と書く人に最高のUXを与えるための超絶ミニマムな技術ブログ',
        fbimg: siteUrl + 'img/icon.png',
        twimg: siteUrl + 'img/icon.png',
        twaccount: '@rxon_',
        icon: siteUrl + 'img/icon.png'
      },
      index: {
        list: sortedPostsInfo
      }
    });
  });
});

app.get('/:post.md', (req, res) => {
  const file = path.format({
    name: req.params.post,
    ext: '.md'
  });

  try {
    fs.statSync(config.mdDir + file);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.status(404).send('Sorry, we cannot find that!');
    }
  }

  getPostInfo(file, true).then(postInfo => {
    res.render('template', {
      head: {
        title: postInfo.title + ' | note - rxon.now.sh',
        url: 'rxon.now.sh/' + postInfo.url,
        description: postInfo.description,
        fbimg: siteUrl + 'img/icon.png',
        twimg: siteUrl + 'img/icon.png',
        twaccount: '@rxon_',
        icon: siteUrl + 'img/icon.png'
      },
      post: {
        title: postInfo.title,
        url: postInfo.url,
        contents: postInfo.html
      }
    });
  });
});

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on http://localhost:3000');
}
