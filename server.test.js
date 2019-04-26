'use strict';
const assert = require('assert');
const mockRequire = require('mock-require');
const request = require('supertest');

const MOCK_CSV_RESPONSE = `From Date,To Date,Total Requests,Passed,Not Passed,Not Found,Error
2019-01-01, 2019-01-31, 20, 15, 2, 2, 1`;

const verifyOptions = function(capturedOptions) {
    assert.equal(capturedOptions.url, '/statistics');
    assert.equal(capturedOptions.baseUrl, 'http://localhost:8081/');
    assert.deepEqual(capturedOptions.qs, { taxYear: '2018/2019' });
    assert.equal(capturedOptions.headers['x-auth-username'], 'some-username');
    assert.equal(capturedOptions.headers['x-auth-userid'], 'some-userid');
};

describe('Stats UI server', function() {
    var server;
    beforeEach(function() {
        server = require('./server');
    });
    afterEach(function() {
        server.close();
    });

    it('responds to the health endpoint', function testHealthEndpoint(done) {
        request(server)
            .get('/healthz')
            .expect(200, done);
    });

    it('returns not found for unknown routes', function testNotFound(done) {
        request(server)
            .get('/anyunknownroute')
            .expect(404, done);
    });

    it('forwards requests to / on to IP API', function testForwarding() {
        var capturedOptions;
        mockRequire('request', function(options, callback) {
            capturedOptions = options;
            callback(null, 200, MOCK_CSV_RESPONSE);
        });
        server = mockRequire.reRequire('./server');

        return request(server)
            .get('/?taxYear=2018/2019')
            .set('x-auth-username', 'some-username')
            .set('x-auth-userid', 'some-userid')
            .expect(200, MOCK_CSV_RESPONSE).
            then(() => verifyOptions(capturedOptions));
    });

    it('returns any errors from IP API to caller', function testErrorForwarding(done) {
        const someErrorHttpCode = 500;
        const someResponse = 'some response';

        mockRequire('request', function(_, callback) {
            callback('any error', someErrorHttpCode, someResponse);
        });
        server = mockRequire.reRequire('./server');

        request(server)
            .get('/?taxYear=2018/2019')
            .expect(someErrorHttpCode, someResponse, done);
    });
});
