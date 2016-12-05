'use strict';

const fs = require('fs');
const path = require('path');

const express = require('express');
const hljs = require('highlight.js');
const marked = require('marked');
const metaMarked = require('meta-marked');
const pug = require('pug');

const app = express();

marked.setOptions({
  gfm: true,
  highlight(code) {
    return hljs.highlightAuto(code).value;
  }
});

app.get('/', (req, res, next) => {
  console.time('Render /');
  console.log('Requested: / at ' + Date.now());
  fs.readdir(path.join(__dirname, '/post/'), (err, files) => {
    res.send(files);
  });
  console.timeEnd('Render /');
});

app.get('/:post', (req, res, next) => {
  console.time('Render ' + req.params.post);
  console.log('Requested: ' + req.params.post + ' at ' + Date.now());
  const file = path.format({
    dir: path.join(__dirname, '/post/'),
    name: req.params.post,
    ext: '.md'
  });
  fs.readFile(file, 'utf-8', (err, md) => {
    if (err) {
      throw err;
    }
    marked(md, (err, html) => {
      if (err) {
        throw err;
      }
      res.send(html);
    });
    // marked(contents);
  });
  console.timeEnd('Render ' + req.params.post);
});

app.listen(3000);
console.log('Running on http://localhost:3000');
