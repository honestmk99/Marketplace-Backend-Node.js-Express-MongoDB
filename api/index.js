require('dotenv').config();
const bodyParser = require('body-parser');
const express = require('express');
const axios = require('axios');
const stripe = require('stripe')('sk_test_51L94vfGMCVDWyFqXmwNL1NcqKemyACXQ1eHC18aHRWuWPLwWIpCyZu9q35HS5m9wrflhCKaWWqVEDtCwo1OTnz9o00igAhmXfu');
const { uuid } = require('uuidv4');
const { mongoClient } = require('../mongo');
// const products = require('./products.json');
const products = require('../test_products.json');
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

var emailServiceRoute = require('./email_service')(app);
var orderRoute = require('./order')(app);
var paymentRoute = require('./payment')(app);
var productRoute = require('./product')(app);
var shipmentRoute = require('./shipment')(app);

app.listen(3001);