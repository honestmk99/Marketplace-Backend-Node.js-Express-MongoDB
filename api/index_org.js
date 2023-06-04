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
//Get all products
app.get('/api/products', async (req, res) => {
  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');
  var products = [];
  db.collection('products').find({}).toArray(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(JSON.stringify(result));
    }
  });
});

//Get all Orders
app.get('/api/orders', async (req, res) => {
  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');
  var products = [];
  db.collection('orders').find({}).toArray(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(JSON.stringify(result));
    }
  });
});

//Products out of stock
app.get('/api/out_of_stock', async (req, res) => {
  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');
  var products = [];
  db.collection('products').find({}).toArray(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(JSON.stringify(result.filter((x) => x.stock == 0)));
    }
  });
});

app.post('/api/send_email/:order_id/:email', (req, res) => {

  const sgMail = require('@sendgrid/mail')
  sgMail.setApiKey("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");

  const msg = {
    to: req.params.email, // Change to your recipient
    from: 'earthpowerful.ep@gamil.com', // Change to your verified sender
    subject: 'Product ordered successfully',
    text: 'you ordered our product successfully.',
    html: '<br/>Order id is '+req.params.order_id+'<br/><strong>Regards</strong>',
  }

  console.log(msg);

  sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode)
      res.send(response[0].statusCode);
      console.log(response[0].headers)
    })
    .catch((error) => {
      res.send({error: error});
      console.error(error)
    })

});

//Create order id
app.post('/api/orders', async (req, res) => {
  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');
  const newOrder = {
    name: req.body.name,
    price: req.body.price,
    quantity: 1,
    id: uuid(),
    status: 'CREATED'
  };
  await db.collection('orders').insertOne(newOrder);

  return res.send(JSON.stringify(newOrder));
});

//Create Shipments
app.post('/api/shipments', async (req, res) => {
  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');
  const newShipment = {
    order_id: req.body.order_id,
    name: req.body.name,
    price: req.body.price,
    quantity: 1,
    id: uuid(),
    status: 'CREATED'
  };
  await db.collection('shipments').insertOne(newShipment);

  return res.send(newShipment);
});

//Create Payment
app.post('/api/payments', async (req, res) => {
  const charge = await stripe.charges.create({
    amount: req.body.price * 100,
    currency: 'usd',
    source: 'tok_amex',
    description: 'Payment for order product - ' + req.body.name,
  });

  if (charge.paid) {
    return res.send(charge);
  }
});

app.get('/api/change_order_status/:id/:status', async (req, res) => {
  var status = req.params.status;
  var order_id = req.params.id;

  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');

  var result = db.collection('orders').update({"id" : order_id}, {$set: { "status" : status}});

  return res.send('success');
});

app.post('/api/decrement_products/:id', async (req, res) => {
  var product_id = req.params.id;

  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');

  var result = db.collection('products').update({"id" : product_id}, {$inc: { "stock" : -1}});

  return res.send('success');
});

app.get('/api/change_order_status/:id/:status', async (req, res) => {
  var status = req.params.status;
  var order_id = req.params.id;

  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');

  var result = db.collection('orders').update({"id" : order_id}, {$set: { "status" : status}});

  return res.send('success');
});

app.get('/api/change_shipment_status/:id/:status', async (req, res) => {
  var status = req.params.status;
  var shipment_id = req.params.id;

  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');

  var result = db.collection('shipments').update({"id" : shipment_id}, {$set: { "status" : status}});

  return res.send('success');
});

//search for a product by id
app.get('/api/products/:id', async (req, res) => {

  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');
  var products = [];
  db.collection('products').find({id: req.params.id}).toArray(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(JSON.stringify(result));
    }
  });
});

//search for a shipment by id
app.get('/api/shipments/:id', async (req, res) => {

  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');
  var products = [];
  db.collection('shipments').find({id: req.params.id}).toArray(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(JSON.stringify(result));
    }
  });
});

//search for product by name
app.get('/api/productsbyname/:name', async (req, res) => {
  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');
  var products = [];
  db.collection('products').find({}).toArray(function (err, result) {
    if (err) {
      res.status(500).send(err);
    } else {
      const product = result.filter(({ name }) => name.search(req.params.name) != -1);
      res.send(JSON.stringify(product));
    }
  });
});
/*
app.get('/api', async (req, res) => {
  const db = await mongoClient();
  if (!db) res.status(500).send('Systems Unavailable');

  const { data } = await axios.get(
    'https://goweather.herokuapp.com/weather/california'
  );
  await db.collection('weather').insertOne(data);

  return res.send(data);
});*/
app.listen(3001);


/*
  db.collection('orders').update(
{"id" : req.params.id},
{$set: { "status" : "created"}});

  
  db.collection('orders').find( { name: "aaa" } )*/