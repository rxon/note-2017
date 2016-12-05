'use strict';

const fs = require('fs');
const path = require('path');

const marked = require('marked');
const hljs = require('highlight.js');
const express = require('express');

const app = express();

marked.setOptions({
  gfm: true,
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
});

app.get('/:post', function(req, res, next) {
  console.time("Render " + req.params.post);

  console.log('Requested: ' + req.params.post + ' at ' + Date.now());
  let file = __dirname + '/text/' + req.params.post + '.md';
  fs.readFile(file, 'utf-8', function(err, contents) {
    if (err) {
      throw err;
    }
    res.send(marked(contents));
  });
  console.timeEnd("Render " + req.params.post);
});

app.listen(3000);
console.log('Running on http://localhost:3000');
