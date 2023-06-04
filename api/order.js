module.exports = function(app){
    const { uuid } = require('uuidv4');
    const { mongoClient } = require('../mongo');
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

    app.get('/api/change_order_status/:id/:status', async (req, res) => {
        var status = req.params.status;
        var order_id = req.params.id;

        const db = await mongoClient();
        if (!db) res.status(500).send('Systems Unavailable');

        var result = db.collection('orders').updateOne({"id" : order_id}, {$set: { "status" : status}});

        return res.send('success');
    });
}