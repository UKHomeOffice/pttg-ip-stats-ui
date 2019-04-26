'use strict';
const express = require('express');

const config = require('./config');
const log = require('./logger');

const app = express();
const port = config.SERVER_PORT;

app.get('/healthz', function healthEndpoint(req, res) {
    res.send({ env: config.ENV, status: 'OK' });
});

const server = app.listen(port, () => {
    log.info('ui on:' + port);
});

module.exports = server;
