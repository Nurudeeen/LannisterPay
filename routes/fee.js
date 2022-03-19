const express = require ('express');
const fee = express.Router();
const FCS = require("../model/paymentSchema")
const eol = require("eol")

fee.post('/fee',  (req, res) => {
    let resp = req.body.FeeConfigurationSpec
    let lines = eol.split(resp)
    lines.forEach(async function(line) {
      FEE_ID = line.substring(0,8)
      FEE_CURRENCY = line.substring(9,12)
      if(line.search ("FLAT_PERC")==-1){
  if (line.search ("PERC")==-1){
      if (line.search ("FLAT")==-1) {
          console.log("Error in input")
          return res.status(409).send({Error: "Check for valid input format"})
      }else{
          FEE_TYPE ="FLAT"
          FEE_VALUE = line.slice(-3)
      }
  }else{
      FEE_TYPE ="PERC"
      FEE_VALUE = line.slice(-4)
  }}else{
      FEE_TYPE ="FLAT_PERC"
      FEE_VALUE = line.slice(-6)
  }
  if (line.search("LOCL")==-1){
      if(line.search("INTL")==-1){
          FEE_LOCALE="*"
      }else{
          FEE_LOCALE="INTL"
      }
  }else{
      FEE_LOCALE="LOCL"
  }
  if (line.search("WALLET-ID")==-1){
      if (line.search("USSD")==-1){
          if (line.search("DEBIT-CARD")==-1){
              if (line.search("CREDIT-CARD")==-1){
                  if (line.search("BANK-ACCOUNT")==-1){
                      FEE_ENTITY = "*"
                  }else{
                      FEE_ENTITY = "BANK-ACCOUNT"
                  }
              }else{
                  FEE_ENTITY = "CREDIT-CARD"
              }
          }else{
              FEE_ENTITY = "DEBIT-CARD"
          }
      }else{
          FEE_ENTITY = "USSD"
      }
  }else{
      FEE_ENTITY = "WALLET-ID"
  }
  if(line.search("MTN") ==-1){
      if (line.search("GLO")==-1){
          if (line.search("AIRTEL")==-1){
              if (line.search("VERVE")==-1){
                  if (line.search("MASTERCARD")==-1){
                      if (line.search("VISA")==-1){
                          if (line.search("AMEX")==-1){
                              ENTITY_PROPERTY = "*"
                          }else{
                              ENTITY_PROPERTY = "AMEX"
                          }
                      }else{
                          ENTITY_PROPERTY = "VISA"
                      }
                  }else{
                      ENTITY_PROPERTY = "MASTERCARD"
                  }
              }else{
                  ENTITY_PROPERTY = "VERVE"
              }
          }else{
              ENTITY_PROPERTY = "AIRTEL"
          }
      }else{
          ENTITY_PROPERTY = "GLO"
      }
  }else{
      ENTITY_PROPERTY = "MTN"
  }
  
      await FCS.create({
          FEE_ID: FEE_ID,
          FEE_CURRENCY:FEE_CURRENCY,
          FEE_TYPE:FEE_TYPE,
          FEE_VALUE:FEE_VALUE,
          FEE_LOCALE:FEE_LOCALE,
          FEE_ENTITY:FEE_ENTITY,
          ENTITY_PROPERTY:ENTITY_PROPERTY
      })
     
    })
    res.status(200).send({ status: 'ok' })
})

module.exports = fee;