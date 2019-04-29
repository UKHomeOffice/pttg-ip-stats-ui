'use strict';
const express = require('express');
const request = require('request');

const config = require('./config');
const log = require('./logger');

const app = express();

const PORT = config.SERVER_PORT;
const API_ROOT = config.API_ROOT || 'http://localhost:8081/';

app.get('/healthz', function healthEndpoint(req, res) {
    res.send({ env: config.ENV, status: 'OK' });
});

app.get('/', function forwardRequestForStatistics(req, res) {
    const upstreamRequestOptions = {
        url: '/statistics',
        baseUrl: API_ROOT,
        qs: req.query,
        headers: {
            'x-auth-username': req.get('x-auth-username'),
            'x-auth-userid': req.get('x-auth-userid')
        }
    };
    request(upstreamRequestOptions, (error, upstreamResponse, upstreamBody) => {
        if (error) {
            log.error(`Error: ${error}`);
        }
        res.status(upstreamResponse.statusCode)
            .set(upstreamResponse.headers)
            .send(upstreamBody);
    });
});

const server = app.listen(PORT, () => {
    log.info('ui on:' + PORT);
});

module.exports = server;
