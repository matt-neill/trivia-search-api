import https from 'https'
import http from 'http'
import fs from 'fs'
import { env, mongo, port, ip, apiRoot } from './config'
import mongoose from './services/mongoose'
import express from './services/express'
import api from './api'

const app = express(apiRoot, api)

let server;

// function requireHTTPS(req, res, next) {
//   // The 'x-forwarded-proto' check is for Heroku
//   if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
//     return res.redirect('https://' + req.get('host') + req.url);
//   }
//   next();
// }

if (process.env.NODE_ENV === 'production') {
  const httpsOptions = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
  }
  server = https.createServer(httpsOptions, app);
}
else {
  server = http.createServer(app);
}

if (mongo.uri) {
  mongoose.connect(mongo.uri)
}
mongoose.Promise = Promise

setImmediate(() => {
  server.listen(port, ip, () => {
    console.log('Express server listening on http://%s:%d, in %s mode', ip, port, env)
  })
})

export default app
