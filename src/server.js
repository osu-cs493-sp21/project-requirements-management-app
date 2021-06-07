const express = require('express');
const {serializeError} = require('serialize-error');

const api = require('./api');
require('./seq');

global.ejwt = require('express-jwt')
global.jwt = require('jsonwebtoken')
global.jwtSecret = "hegeon4ebnjk5tsn9wg0"

Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () {
    json = serializeError(this);
    // if (json.name == "SequelizeValidationError"){
    //   json = json.errors[0].message
    // }
    return json
  }
});

const app = express();
const port = process.env.PORT || 8000;
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

app.use('*', function (req, res) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  });
});

app.listen(port, function () {
  console.log("== Server is running on port", port);
});
