module.exports = function(app){
    const stripe = require('stripe')('sk_test_51L94vfGMCVDWyFqXmwNL1NcqKemyACXQ1eHC18aHRWuWPLwWIpCyZu9q35HS5m9wrflhCKaWWqVEDtCwo1OTnz9o00igAhmXfu');
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

    app.post('/api/check_card', async (req, res) => {
        const paymentMethod = await stripe.paymentMethods.create({
          type: 'card',
          card: {
            number: req.body.card,
            exp_month: parseInt(req.body.exp_month),
            exp_year: parseInt(req.body.exp_year),
            cvc: req.body.cvc,
          },
        });

        if (paymentMethod.id != '') {
            return res.send(paymentMethod);
        }
    });
}