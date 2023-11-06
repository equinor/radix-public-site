/*jslint node: true */
/*jshint esversion: 6 */
/*jshint mocha:true */

'use strict';

var request = require('supertest');
var expect = require('chai').expect;

// start app server here 
var app = require('../app');

beforeEach(function () {
 
});

// Run test on end-point
describe('Testing index router', function () {
    it('GET / should return 200', function (done) {
        request(app)
            .get('/')
            .expect(200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .end(function (err) {
                if (err)
                    return done(err); // if response is 500 or 404 & err, test case will fail
                done();
            });
    });
    it('GET / body should contain valid echo object', function (done){
        request(app)
            .get('/')
            .expect(function(res) {
                expect(res.header).to.have.property('content-type');
                expect(res.body).to.have.property('RADIX_CLUSTERNAME');
                expect(res.body).to.have.property('RADIX_COMPONENT');
                expect(res.body).to.have.property('RADIX_ENVIRONMENT');
                expect(res.body).to.have.property('HOSTNAME');
                expect(res.body).to.have.property('HOSTPLATFORM');
            })
            .end(function (err) {
                if (err)
                    return done(err);
                done();
            });
    });
    it('GET /nowhere should return 404', function (done) {
        request(app)
            .get('/nowhere')
            .expect(404)
            .end(function (err) {
                if (err)
                    return done(err);
                done();
            });
    });
});