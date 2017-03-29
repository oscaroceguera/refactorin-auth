const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const config = require('./config/main')
const router = require('./router');
mongoose.Promise = global.Promise;

mongoose.connect(config.database)

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Setting up basic middleware for all Express requests
app.use(logger('dev')); // Log requests to API using morgan

// Enable CORS from client-side
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials");
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

router(app);

const server = app.listen(config.port, () => {
  console.log(`http://localhost:${config.port}`);
})
