var chai = require('chai');
var chaiHttp = require('chai-http');
var async = require('async');

var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();

var http = require('http');
chai.use(chaiHttp);

describe('TrailChat Azure tests', function () {
  this.timeout(15000);

  var requestResult;
  var response;

  before(function (done) {
    chai.request('http://trailchatclt.azurewebsites.net')
      .get("/messages")
      .end(function (err, res) {
        requestResult = res.body;
        response = res;
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        response.body.should.be.a('array');
        response.should.be.json;
        done();
      });
  });

  it('Should return an array of messages', function () {
    expect(response).to.exist;
    expect(response).to.have.status(200);
    expect(response).to.be.an('object');
    expect(response.body).to.have.length.above(5);
    expect(response).to.have.headers;
  });

  it('The first entry in the messages array has known properties', function () {
    expect(requestResult[0]).to.include.keys('_id');
    expect(requestResult[0]).to.include.property('message_content');
    expect(requestResult[0]).to.include.property('message_type');
    expect(requestResult[0]).to.include.property('message_date');
    expect(requestResult[0]).to.include.property('message_id');
    expect(requestResult[0]).to.include.property('chat_id');
    expect(response.body).to.not.be.a.string;
  });

  it('The elements in the messages array have the expected properties', function () {
    expect(response.body).to.satisfy(
      function (body) {
        for (var i = 0; i < body.length; i++) {
          expect(body[i]).to.have.property('message_content');
          expect(body[i]).to.have.property('message_type');
          expect(body[i]).to.have.property('message_date');
          expect(body[i]).to.have.property('message_id');
          expect(body[i]).to.have.property('message_id').that.is.a('number');
        }
        return true;
      });
    //done();
  });

});
