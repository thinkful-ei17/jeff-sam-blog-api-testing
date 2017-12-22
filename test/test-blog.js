'use strict'; 

const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();
chai.use(chaiHttp);

describe('Blog', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  it('should list posts on GET', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);

        const expectedKeys = ['title', 'content', 'author', 'id', 'publishDate'];

        res.body.forEach(function (item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });
  it('should create post in POST', function() {
    
    const newPost = { title : 'Second Post', content: 'I am so happy to write another post', author: 'Sam', publishDate: 'Today'};
    
    return chai.request(app)
      .post('/blog-posts')
      .send(newPost)
      .then(function(res){
        res.should.have.status(201);
        res.should.be.json;
        res.should.be.a('object');
        res.body.should.include.key('title', 'content', 'author', 'id', 'publishDate');
        res.body.id.should.not.be.null;
        res.body.should.deep.equal(Object.assign(newPost, {id: res.body.id}));
      });
  });
  it('should update post in PUT', function(){
    
    const updatedPost = {title: 'Updated Post', content: 'Forgot to add this crucial detail', author: 'Jeff', publishDate: 'Yesterday'};

    return chai.request(app)
      .get('/blog-posts')
      .then(function(res){
        updatedPost.id = res.body[0].id;
        return chai.request(app)
          .put(`/blog-posts/${updatedPost.id}`)
          .send(updatedPost);
      })
      .then(function(res){
        res.should.have.status(204);
      });
  });

  it ('should delete post in DELETE', function(){
    chai.request(app)
      .get('/blog-posts')
      .then(function(res){
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`);
      })
      .then(function(res){
        res.status.should.be(204);
      });
  });
});