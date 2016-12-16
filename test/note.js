'use strict';
const assert = require('assert');
const rewire = require('rewire');
const request = require('supertest');

const note = rewire('../note.js');
const getPostInfo = note.__get__('getPostInfo');

const app = require('../note.js');

describe('note.js', () => {
  describe('getPostInfo()', () => {
    it('should return post infomation', () => {
      const o = {
        title: 'webpack.config.jsに関する知見、5選',
        description: '休日を粉砕して手に入れた知見です',
        date: '2016-12-10',
        url: 'webpackSmallArt.md',
        html: null
      };
      return getPostInfo('webpackSmallArt.md', false).then(data => {
        assert.deepEqual(data, o);
      });
    });
  });

  describe('GET /', () => {
    it('render with vars and 200', done => {
      request(app)
        .get('/')
        // .expect(function(res) {
        //   res.body.head.title: 'note - rxon\'s miniminimal tech blog';
        // })
        .expect(200, done);
    });
  });

  describe('GET /:post.md', () => {
    it('render with vars and 200', done => {
      request(app)
        .get('/webpackSmallArt.md')
        // vars
        .expect(200, done);
    });
  });

  describe('POST Not found', () => {
    it('respond with 404', done => {
      request(app)
        .get('/notfound.md')
        .expect(404, done);
    });
  });

  describe('Not found', () => {
    it('respond with 404', done => {
      request(app)
        .get('/notfound')
        .expect(404, done);
    });
  });
});
