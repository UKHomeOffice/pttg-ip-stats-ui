'use strict';
const express = require('express');
const config = require('./config');

const app = express();
const port = config.SERVER_PORT;

app.get('/healthz', function (req, res) {
  res.send({env: process.env.ENV, status: 'OK'})
})

const server = app.listen(port, () => {
    console.log('ui on:' + port)
})

module.exports = server;
