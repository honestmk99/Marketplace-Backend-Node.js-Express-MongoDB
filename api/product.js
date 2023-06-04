module.exports = function(app){
    const { uuid } = require('uuidv4');
    const { mongoClient } = require('../mongo');

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

    app.post('/api/decrement_products/:id', async (req, res) => {
        var product_id = req.params.id;

        const db = await mongoClient();
        if (!db) res.status(500).send('Systems Unavailable');

        var result = db.collection('products').update({"id" : product_id}, {$inc: { "stock" : -1}});

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
}