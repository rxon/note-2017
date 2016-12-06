'use strict';

const fs = require('fs');
const path = require('path');

const ejs = require('ejs');
const express = require('express');
const hljs = require('highlight.js');
const marked = require('marked');
const metaMarked = require('meta-marked');

const app = express();
const mdDir = path.join(__dirname, '/post/');
const viewsDir = path.join(__dirname, '/views/');

app.engine('.html', ejs.__express);
app.set('views', viewsDir);
app.set('view engine', 'html');

function readMd(req, res, next) {
  fs.readdir(mdDir, (err, files) => {
    if (err) {
      throw new Error('Failed to read md dir');
    }
    files.forEach(file => {

      const mdPath = path.join(mdDir, file);
      fs.readFile(mdPath, 'utf-8', (err, md) => {
        if (err) {
          throw new Error('Failed to read md file');
        }
        req.filename = file;
        req.contents = metaMarked(md);
        next();
      });
    });
  });
}

app.get('/', readMd, (req, res) => {
  res.send({
    postList: {
      title: req.contents.meta.title,
      url: req.filename
    }
    // head.title
    // head.description
    // head.url
    // head.fbimg
    // head.twimg
    // head.twaccount
  });
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
  fs.readFile(file, 'utf-8', (err, md) => {
    if (err) {
      throw new Error('Failed to read md file');
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
