const express = require('express');
const ethSigUtil = require('eth-sig-util');
const app = express();
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors(corsOptions)) // Use this after the variable declaration
app.use(express.json())
const Database = require("@replit/database")
const db = new Database()

app.get('/offer', (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const sellerAddress =req.query.seller_address;
  db.get(sellerAddress).then(value => {
    res.send(value);
  });
});

app.post('/offer', function (req, res) {
  console.log('----- accessed');

  const sellerAddress = req.body.seller_address;
  const sellerLockerId = req.body.seller_locker_id;
  const buyerLockerId = req.body.buyer_locker_id;
  const buyerAddress = req.body.buyer_address;
  const validBlockNumber = req.body.valid_block_number;
  const buyerOfferSignature = req.body.buyer_offer_signature;
  const messageHash = req.body.message_hash;

   const recoveredAddr = ethSigUtil.recoverPersonalSignature({
    data: messageHash,
    sig: buyerOfferSignature,
  });

  data = { 
    "seller_address": sellerAddress, "seller_locker_id": sellerLockerId, "buyer_locker_id": buyerLockerId, 
    "buyer_address": buyerAddress, "valid_block_number": validBlockNumber, "buyer_offer_signature": buyerOfferSignature, "message_hash": messageHash
  }

  if(recoveredAddr === buyerAddress){
    // authentication success
    // save to db
    
    // offer for seller
    db.get(sellerAddress).then(value => {
      let existing_data = [];
      if(value != null){
        existing_data = JSON.parse(value);
      }
      var filtered = existing_data.filter(function(x) { return x.message_hash == messageHash; });

      if(filtered.length == 0){
        existing_data.push(data)
      }

      db.set(sellerAddress, JSON.stringify(existing_data)).then(() => {});
    });     
  }

  db.get(sellerAddress).then(value => {
    console.log("result", value);
  });

  res.send('Got a POST request at /offer')
})

app.listen(3000, () => {
  console.log('server started');
});
