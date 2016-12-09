'use strict';

const fs = require('fs');
const path = require('path');

const express = require('express');
const hljs = require('highlight.js');
const _ = require('lodash');
const marked = require('marked');
const mustache = require('mustache');

const app = express();
const mdDir = path.join(__dirname, '/post/');
const viewsDir = path.join(__dirname, '/views/');

app.engine('mustache', mustache);
app.set('views', viewsDir);
app.set('view engine', 'mustache');

function listUpPost(req, res, next) {
  return new Promise((resolve, reject) => {
    fs.readdir(mdDir, (err, mdFiles) => {
      if (err) {
        throw new Error('Failed to read mdDir');
      }
      const postList = [];
      for (let i = 0; i < mdFiles.length; i++) {
        fs.readFile(mdDir + mdFiles[i], 'utf-8', (err, md) => {
          if (err) {
            throw new Error('Failed to read md file: ' + mdFiles[i]);
          }
          const postTitle = md.match(/^\#\s(.)+\n/)[0].match(/[^#\n\s]+/);
          const postDescription = md.match(/\n\>(.)+\n/)[0].match(/[^>\n\s]+/);
          postList.push({
            title: postTitle[0],
            description: postDescription[0],
            url: mdFiles[i]
          });
          console.log(postList);
          req.postList = postList;
        });
      }
    });
  });
  next();
}

function readMd(mdPath) {
  return function (req, res, next) {
    fs.readFile(mdPath, 'utf-8', (err, md) => {
      if (err) {
        throw new Error('Failed to read md file: ' + mdPath);
      }
      req.contents = marked(md);
      next();
    });
  };
}

app.get('/', listUpPost, (req, res) => {
  // listUpPost().then(postList => {
  //   // req.postList = postList;
  //   console.log(postList);
  //   res.send(req.postList);
  // });
  res.send(req.postList);
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

marked.setOptions({
  gfm: true,
  highlight(code) {
    return hljs.highlightAuto(code).value;
  }
});

app.get('/:post.md', (req, res) => {
  const file = path.format({
    dir: mdDir,
    name: req.params.post,
    ext: '.md'
  });

  // res.send(req.contents.html);
  fs.readFile(file, 'utf-8', (err, md) => {
    if (err) {
      throw new Error('Failed to read md: ' + file);
    }
    marked(md, (err, html) => {
      if (err) {
        throw new Error('Failed to compile md to html');
      }
      res.send(html);
    });
    // marked(contents);
  });
});

app.listen(3000);
console.log('Running on http://localhost:3000');
