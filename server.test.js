const mockRequire = require('mock-require');
const request = require('supertest');

const MOCK_CSV_RESPONSE = `From Date,To Date,Total Requests,Passed,Not Passed,Not Found,Error
2019-01-01, 2019-01-31, 20, 15, 2, 2, 1`

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

    it('forwards requests to / on to IP API', function testForwarding(done) {
        var capturedOptions;
        mockRequire('request', function(options, callback) {
            capturedOptions = options;
            callback('', '', MOCK_CSV_RESPONSE);
        })
        server = mockRequire.reRequire('./server');
        // verifyOptions(capturedOptions);
        request(server)
            .get('/?taxYear=2018/2019')
            .expect(200, MOCK_CSV_RESPONSE, done);
    });
})
