'use strict';
const express = require('express');
const request = require('request');

const config = require('./config');
const log = require('./logger');

const app = express();

const PORT = config.SERVER_PORT;
const API_ROOT = process.env.API_ROOT || 'http://localhost:8081/';

app.get('/healthz', function healthEndpoint(req, res) {
    res.send({ env: config.ENV, status: 'OK' });
});

module.exports = server;
