module.exports = function(app){
    const { uuid } = require('uuidv4');
    const { mongoClient } = require('../mongo');
    
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

    app.get('/api/change_shipment_status/:id/:status', async (req, res) => {
        var status = req.params.status;
        var shipment_id = req.params.id;

        const db = await mongoClient();
        if (!db) res.status(500).send('Systems Unavailable');

        var result = db.collection('shipments').update({"id" : shipment_id}, {$set: { "status" : status}});

        return res.send('success');
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

    //Get all shipments
    app.get('/api/shipments', async (req, res) => {
        const db = await mongoClient();
        if (!db) res.status(500).send('Systems Unavailable');
        var shipments = [];
        db.collection('shipments').find({}).toArray(function (err, result) {
            if (err) {
                res.status(500).send(err);
            } else {
                res.send(JSON.stringify(result));
            }
        });
    });
}