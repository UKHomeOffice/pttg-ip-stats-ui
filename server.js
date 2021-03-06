'use strict';
const express = require('express');
const fs = require('fs');
const request = require('request');
const uuid = require('uuid/v4');

const config = require('./config');
const log = require('./logger');

const app = express();

const PORT = config.SERVER_PORT;
const API_ROOT = config.API_ROOT || 'http://localhost:8081/';
const CA_CERTS_PATH = config.CA_CERTS_PATH;
const IP_API_AUTH = config.IP_API_AUTH || '';

function addCaCert(opts) {
    if (opts.baseUrl && opts.baseUrl.toLowerCase().startsWith('https')) {
        log.info(`Adding CA Cert from ${CA_CERTS_PATH}`);
        opts.ca = fs.readFileSync(CA_CERTS_PATH, 'utf8');
        opts.strictSSL = false;
    }
    return opts;
}

app.get('/healthz', function healthEndpoint(req, res) {
    res.send({ env: config.ENV, status: 'OK' });
});

app.get('/', function forwardRequestForStatistics(req, res, next) {
    let upstreamRequestOptions = {
        url: '/statistics',
        baseUrl: API_ROOT,
        qs: req.query,
        headers: {
            'x-auth-username': req.get('x-auth-username'),
            'x-auth-userid': req.get('x-auth-userid'),
            'x-correlation-id': uuid(),
            'Authorization': 'Basic ' + Buffer.from(IP_API_AUTH).toString('base64'),
        }
    };
    upstreamRequestOptions = addCaCert(upstreamRequestOptions);

    request(upstreamRequestOptions, (error, upstreamResponse, upstreamBody) => {
        if (error) {
            log.error(`Error: ${error}`);
            return next(error);
        }
        return res.status(upstreamResponse.statusCode)
            .set(upstreamResponse.headers)
            .send(upstreamBody);
    });
});

const server = app.listen(PORT, () => {
    log.info('ui on:' + PORT);
});

module.exports = server;
