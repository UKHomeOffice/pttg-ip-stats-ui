const express = require('express');
const request = require('request');

const app = express();
const port = process.env.SERVER_PORT || '8000';

app.get('/healthz', function(req, res) {
    res.send({ env: process.env.ENV, status: 'OK' })
})

app.get('/', function(req, res) {
    const requestOptions = {
        url: '/statistics',
        baseUrl: 'http://localhost:8081/',
        qs: req.query,
        headers: {
            'x-auth-username': req.get('x-auth-username'),
            'x-auth-userid': req.get('x-auth-userid')
        }
    };
    request(requestOptions, (error, response, body) => {
        res.status(response).send(body);
    })
})

const server = app.listen(port, () => {
    console.log('ui on:' + port)
})

module.exports = server;
