const express = require('express');
const api = require('./api');
const app = express();
const port = process.env.PORT || 8000;

require('./seq');

global.ejwt = require('express-jwt')
global.jwt = require('jsonwebtoken')
global.jwtSecret = "hegeon4ebnjk5tsn9wg0"

app.use(express.json());
app.use(express.static('public'));

app.use('/', api);

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: "Not authorized" });
    return
  }
  next()
});

app.use('*', function (req, res, next) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

app.listen(port, function () {
  console.log("== Server is running on port", port);
});
