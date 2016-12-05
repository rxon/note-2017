'use strict';

const fs = require('fs');
// const path = require('path');

const glob = require('glob');
const marked = require('marked');
const express = require('express');
const hljs = require('highlight.js');

const app = express();

marked.setOptions({
  gfm: true,
  highlight: function(code) {
    return hljs.highlightAuto(code).value;
  }
});

glob('text/*.md', (er, files) => {
  files.forEach(file => {
    fs.readFile(file, 'utf-8', (err, contents) => {
      if (err) {
        throw err;
      }

      const output = marked(contents);

      app.get('/', (req, res) => {
        res.send(output);
      });
      // fs.writeFile('build/' + path.basename(file, '.md') + '.html', output);
    });
  });
});

app.listen(3000);
console.log('Running on http://localhost:3000');

/////////////////////////////////////////////


function md2html(file) {
  fs.readFile(file, 'utf-8', function(err, contents) {
    if (err) {
      throw err;
    }
    console.log('Generating: ' + file);
    return marked(contents);
  });
};
