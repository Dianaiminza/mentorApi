const app = require('./index');
const supertest = require('supertest');
const request = supertest(app);
const expect = require("chai").expect;
  
  describe("POST /signrup", function() {
    
    it("it should have status code 200 if the user is successfully created", function(done) {
      request
      
     .post('/signup')
     .send({"email": user.email, password: "123456"})
  
      .expect(200)
      .end(function(err, res){
        if (err) done(err);
        done();
      });
  });
});

describe("POST /signin", function() {
  it("it should have status code 200 if the user successfully logs in", function(done) {
    request
   .post('/signin')
   .send({"email": user.email, password: "123456"})
      .expect(200)
      .end(function(err, res){
        if (err) done(err);
        done();
      });
  });
});

describe("POST /createMentor", function() {
    
  it("it should have status code 200 if the mentor is successfully created", function(done) {
    request
    
   .post('/createMentor')
   .send({"email": user.email, password: "123456"})

    .expect(200)
    .end(function(err, res){
      if (err) done(err);
      done();
    });
});
});