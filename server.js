const express = require('express');
const request = require('request');

const app = express();
const port = process.env.SERVER_PORT || '8000';

app.get('/healthz', function(req, res) {
    res.send({ env: process.env.ENV, status: 'OK' })
})

app.get('/', function(req, res) {
    request({}, (error, response, body) => {
        res.send(body);
    })
})

const server = app.listen(port, () => {
    console.log('ui on:' + port)
})

module.exports = server;
