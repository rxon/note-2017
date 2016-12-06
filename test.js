'use strict';

const fs = require('fs');
const path = require('path');
const metaMarked = require('meta-marked');

const mdDir = path.join(__dirname, '/post/');
// const viewsDir = path.join(__dirname, '/views/');

fs.readdir(mdDir, (err, files) => {
  files.forEach(file => {
    const mdPath = path.join(mdDir, file);
    fs.readFile(mdPath, 'utf-8', (err, md) => {
      if (err) {
        throw new Error('Failed to read md file');
      }
      const contents = metaMarked(md);
      console.log(contents);
    });
  });
});
