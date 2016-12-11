'use strict';

const fs = require('fs');
const path = require('path');

const express = require('express');
const hljs = require('highlight.js');
const _ = require('lodash');
const marked = require('marked');
const mustache = require('mustache');

const app = express();
const config = {
  mdDir: path.join(__dirname, '/post/'),
  viewsDir: path.join(__dirname, '/views/'),
  staticDir: path.join(__dirname, '/public/')
};

app.engine('mustache', mustache);
app.set('view engine', 'mustache');
app.set('views', config.viewsDir);

app.use(express.static(config.staticDir));

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
        html: withHtml ? marked(md) : null
      });
    });
  });
}

app.get('/', (req, res) => {
  fs.readdir(config.mdDir, (err, mdFiles) => {
    if (err) {
      throw new Error('Failed to read mdDir');
    }
    const postInfoList = [];
    for (let i = 0; i < mdFiles.length; i++) {
      getPostInfo.then(list => {
        postInfoList.push(list);
      });
    }
  });

  // res.send(req.postList);

  // res.render('index', {
  //   locals: {
  //     postList: {
  //       title: req.contents.meta.title,
  //       url: req.filename
  //     }
  //     // head.title
  //     // head.description
  //     // head.url
  //     // head.fbimg
  //     // head.twimg
  //     // head.twaccount
  //   }
  //
  // });
});

app.get('/:post.md', (req, res) => {
  const file = path.format({
    dir: config.mdDir,
    name: req.params.post,
    ext: '.md'
  });
});

app.listen(3000);
console.log('Running on http://localhost:3000');
