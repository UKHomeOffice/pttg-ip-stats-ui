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
            callback(null, { statusCode: 200 }, MOCK_CSV_RESPONSE);
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
        const someError = 'some sort of error';

        mockRequire('request', function(_, callback) {
            callback(someError, { statusCode: someErrorHttpCode }, 'any response');
        });
        server = mockRequire.reRequire('./server');

        request(server)
            .get('/?taxYear=2018/2019')
            .expect(someErrorHttpCode)
            .expect((res) => {
                if (!(res.text.includes(someError))) {
                     throw new Error(`Error: "${someError}" not in response `);
                 }
            })
            .end(done);
    });

    it('returns any headers from IP API to the caller', function testHeaderForwarding(done) {
        const someHeaders = { 'content-type': 'text/csv; charset=utf-8' };
        const someResponse = { headers: someHeaders, body: '', statusCode: 200 };

        mockRequire('request', function(_, callback) {
            callback(null, someResponse, 'any response body');
        });
        server = mockRequire.reRequire('./server');

        request(server)
            .get('/?taxYear=2018/2019')
            .expect(200)
            .expect('content-type', 'text/csv; charset=utf-8', done);
    });
});
