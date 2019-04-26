'use strict';
const express = require('express');
const config = require('./config');

const app = express();
const port = config.SERVER_PORT;

app.get('/healthz', function healthEndpoint(req, res) {
    res.send({ env: config.ENV, status: 'OK' });
});

const server = app.listen(port, () => {
    console.log('ui on:' + port);
});

module.exports = server;
