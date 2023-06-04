module.exports = function(app){
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
}