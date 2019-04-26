const express = require('express');

const app = express();
const port = process.env.SERVER_PORT || '8000';

app.get('/healthz', function (req, res) {
  res.send({env: process.env.ENV, status: 'OK'})
})

const server = app.listen(port, () => {
    console.log('ui on:' + port)
})

module.exports = server;
