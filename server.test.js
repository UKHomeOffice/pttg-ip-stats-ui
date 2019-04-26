'use strict';
const request = require('supertest');

describe('Stats UI server', function () {
    var server;
    beforeEach(function() {
        server = require('./server');
    });
    afterEach(function() {
        server.close();
    })

    it('responds to the health endpoint', function testHealthEndpoint(done) {
        request(server)
            .get('/healthz')
            .expect(200, done);
    })
})
