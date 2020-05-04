const express = require('express');
const ejs=require('ejs');
const paypal = require('paypal-rest-sdk');
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AS8oJGmoe-WrMp6ocqkzUGQkRKtZHreMrapG1CPD9tE0i8Jje4xWTNZ_AGsN3siEoi25Ynb3g1Zaa_ui',
    'client_secret': 'EFiybHwX0Dmr58GLvoCeTu7n9Pb-Ba7oCYsG3sgA6BHA6bT1ycM2Qg2Tew_TeTwsQPxCIJKix11KZgNs'
  });
const app=express();
app.set('view engine','ejs');
app.use( express.static( "public") );
app.get('/',(req,res)=>res.render('index'));
app.post('/pay',(req,res)=>{
    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "https://paypal-1712253.herokuapp.com/success",
            "cancel_url": "https://paypal-1712253.herokuapp.com/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "BCS Okamoto 3 pack",
                    "sku": "001",
                    "price": "5.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "5.00"
            },
            "description": "This is the payment description."
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i=0;i<payment.links.length;i++){
            if(payment.links[i].rel==='approval_url'){
                res.redirect(payment.links[i].href);
            }
        }
    }
});
    
})

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "5.00"
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.render('success');
      }
  });
  });

app.get('/cancel', (req, res) => res.render('cancel'));
app.listen(process.env.PORT || 3000,()=>console.log('server is runing'));