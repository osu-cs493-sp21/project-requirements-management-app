require('./seq')

const { serializeError } = require('serialize-error')
// This will convert errors into JSON
Object.defineProperty(Error.prototype, 'toJSON', {
  value: function () { return serializeError(this) }
})

const express = require('express')
const socket = require('socket.io')

const app = express()
const port = process.env.PORT || 8000

app.use(express.json())
app.use(express.static('public'))
app.use(express.static('userImages'))

global.ejwt = require('express-jwt')
global.jwt = require('jsonwebtoken')
global.jwtSecret = "hegeon4ebnjk5tsn9wg0"
// Instead of using the built in `credentialsRequired`, we just use custom checks
app.use(ejwt({ secret: jwtSecret, algorithms: ['HS256'], credentialsRequired: false }))
// This ensures a jwt is detected before serving any other endpoints (except login)
// app.use(function (req, res, next) {
//   if (!req.user && !req.path.startsWith('/users/login')) {
//     res.status(400).json({ error: "Missing or invalid jwt" })
//     return
//   }
//   next()
// })

// This bypasses all auth, comment this out to test auth
// Also uncomment the block above
app.use(function (req, res, next) {
  req.user = { projectId: 1 }
  next()
})

const api = require('./api')
app.use('/', api)

app.use('*', function (req, res) {
  res.status(404).json({
    error: "Requested resource " + req.originalUrl + " does not exist"
  })
})

const server = app.listen(port, function () {
  console.log("== Server is running on port", port)
})

const io = new socket.Server(server, {
  cors: {
    origin: '*',
  },
})

require('./socket.js')(io);
