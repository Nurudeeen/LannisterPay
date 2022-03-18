const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const eol = require("eol")
require("dotenv").config();
const db = require("./model/db")
const FCS = require("./model/paymentSchema")

app.use(bodyParser.json())
db.connect();
app.post('/fee',  (req, res) => {
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
app.post('/compute-transaction-fee',  async (req, res) => {
    const query = req.body
    const ErrorMessage = `No fee configuration for ${query.Currency} transactions`
    if (query.Currency !== "NGN") return res.status(404).send({Error: ErrorMessage})
    if (query.PaymentEntity.Country==""|| query.CurrencyCountry ==""){
        FEE_LOCALE = "*"
    }else{
    if (query.PaymentEntity.Country==query.CurrencyCountry){
        FEE_LOCALE = "LOCL"
    }else{
        FEE_LOCALE = "INTL"
    }}
    if(query.PaymentEntity.Brand !== ""){
       if  (query.PaymentEntity.Type !== "CREDIT-CARD"){
          if (query.PaymentEntity.Type !== "DEBIT-CARD"){
            FEE_ENTITY = "*"
            ENTITY_PROPERTY = "*"
          }else{
            FEE_ENTITY = "DEBIT-CARD"
            if (query.PaymentEntity.Brand !=="AMEX"||"VISA"||"VERVE"||"MASTERCARD"){
                ENTITY_PROPERTY = "*"
            }else{
                ENTITY_PROPERTY = query.PaymentEntity.Brand
            }
          }
       }else{
           FEE_ENTITY = "CREDIT-CARD"
           if (query.PaymentEntity.Brand !=="AMEX"||"VISA"||"VERVE"||"MASTERCARD"){
            ENTITY_PROPERTY = "*"
        }else{
            ENTITY_PROPERTY = query.PaymentEntity.Brand
        }
       }
    }else{ 
        if (query.PaymentEntity.Type !== "USSD"){
            if (query.PaymentEntity.Type !== "WALLET-ID"){
                if (query.PaymentEntity.Type !== "BANK-ACCOUNT"){
                    FEE_ENTITY = "*"
                    ENTITY_PROPERTY = "*"
                }else{
                    FEE_ENTITY = "BANK-ACCOUNT"
                    ENTITY_PROPERTY = "*"
                }
            }else{
                FEE_ENTITY = "WALLET-ID"
                ENTITY_PROPERTY="*"
            }
        }else{
            FEE_ENTITY = "USSD"
            if (query.PaymentEntity.Issuer !== "MTN"){
            if (query.PaymentEntity.Issuer!=="GLO"){
            if (query.PaymentEntity.Issuer !=="AIRTEL"){
                ENTITY_PROPERTY="*"
            }else{
                ENTITY_PROPERTY="AIRTEL"
            }
            }else{
                ENTITY_PROPERTY="GLO"
            }
            }else{
                ENTITY_PROPERTY="MTN"
            }
        }
    }
    // console.log({FEE_ENTITY: FEE_ENTITY,
    //     ENTITY_PROPERTY:ENTITY_PROPERTY,
    //     FEE_LOCALE:FEE_LOCALE})
     Fee_Config = await FCS.findOne({FEE_ENTITY: FEE_ENTITY,
        ENTITY_PROPERTY:ENTITY_PROPERTY,
        FEE_LOCALE:FEE_LOCALE})
    if (!Fee_Config) {
        const Fee_Config = await FCS.findOne({FEE_ENTITY: FEE_ENTITY,
            ENTITY_PROPERTY:ENTITY_PROPERTY,
            FEE_LOCALE:"*"
            })

        if (!Fee_Config){
            const Fee_Config = await FCS.findOne({FEE_ENTITY: FEE_ENTITY,
                ENTITY_PROPERTY:"*",
                FEE_LOCALE:"*"
                })
            
             if (!Fee_Config)   {
                 const Fee_Config = await FCS.findOne({FEE_ENTITY: "*",
                    ENTITY_PROPERTY:"*",
                    FEE_LOCALE:"*"
                    })
                if (Fee_Config.FEE_TYPE !== "FLAT_PERC") {
                    if (Fee_Config.FEE_TYPE !== "FLAT"){
                        if (Fee_Config.FEE_TYPE !== "PERC"){
                            return res.status(500).send({Error: "Something went Wrong"})
                        }else{
                            Value = Number(Fee_Config.FEE_VALUE)
                            AppliedFeeValue = ((Value * query.Amount ) / 100)
                            if (query.Customer.BearsFee == true){
                                ChargeAmount = query.Amount + AppliedFeeValue
                            }else{
                                ChargeAmount = query.Amount
                            }
                            const SettledAmount = ChargeAmount - AppliedFeeValue
                            res.status(200).send({
                                AppliedFeeID: Fee_Config.FEE_ID,
                                AppliedFeeValue: AppliedFeeValue,
                                ChargeAmount: ChargeAmount,
                                SettlementAmount: SettledAmount
                            })
                        }
                    }else{
                        Value = Number(Fee_Config.FEE_VALUE)
                        AppliedFeeValue = Value
                        if (query.Customer.BearsFee == true){
                            ChargeAmount = query.Amount + AppliedFeeValue
                        }else{
                            ChargeAmount = query.Amount
                        }
                        const SettledAmount = ChargeAmount - AppliedFeeValue
                        res.status(200).send({
                            AppliedFeeID: Fee_Config.FEE_ID,
                            AppliedFeeValue: AppliedFeeValue,
                            ChargeAmount: ChargeAmount,
                            SettlementAmount: SettledAmount
                        }) 
                    }
                }else{
                    Arr = Fee_Config.FEE_VALUE.split(":")
                    Value_Flat = Number(Arr[0])
                    Value_Perc = Number(Arr[1])
                    AppliedFeeValue = Value_Flat + ((Value_Perc * query.Amount ) / 100)
                    if (query.Customer.BearsFee == true){
                        ChargeAmount = query.Amount + AppliedFeeValue
                    }else{
                        ChargeAmount = query.Amount
                    }
                    SettledAmount = ChargeAmount - AppliedFeeValue
                    res.status(200).send({
                        AppliedFeeID: Fee_Config.FEE_ID,
                        AppliedFeeValue: AppliedFeeValue,
                        ChargeAmount: ChargeAmount,
                        SettlementAmount: SettledAmount
                    }) 
                }
             } else{
                    return res.status(404).send({message: "FCS for this Customer not found, Please Update the FCS"})
             }
        }else{
            if (Fee_Config.FEE_TYPE !== "FLAT_PERC") {
                if (Fee_Config.FEE_TYPE !== "FLAT"){
                    if (Fee_Config.FEE_TYPE !== "PERC"){
                        return res.status(500).send({Error: "Something went Wrong"})
                    }else{
                        Value = Number(Fee_Config.FEE_VALUE)
                        AppliedFeeValue = ((Value * query.Amount ) / 100)
                        if (query.Customer.BearsFee == true){
                            ChargeAmount = query.Amount + AppliedFeeValue
                        }else{
                            ChargeAmount = query.Amount
                        }
                        SettledAmount = ChargeAmount - AppliedFeeValue
                        res.status(200).send({
                            AppliedFeeID: Fee_Config.FEE_ID,
                            AppliedFeeValue: AppliedFeeValue,
                            ChargeAmount: ChargeAmount,
                            SettlementAmount: SettledAmount
                        })
                    }
                }else{
                    Value = Number(Fee_Config.FEE_VALUE)
                    AppliedFeeValue = Value
                    if (query.Customer.BearsFee == true){
                        ChargeAmount = query.Amount + AppliedFeeValue
                    }else{
                        ChargeAmount = query.Amount
                    }
                    SettledAmount = ChargeAmount - AppliedFeeValue
                    res.status(200).send({
                        AppliedFeeID: Fee_Config.FEE_ID,
                        AppliedFeeValue: AppliedFeeValue,
                        ChargeAmount: ChargeAmount,
                        SettlementAmount: SettledAmount
                    }) 
                }
            }else{
                Arr = Fee_Config.FEE_VALUE.split(":")
                Value_Flat = Number(Arr[0])
                Value_Perc = Number(Arr[1])
                AppliedFeeValue = Value_Flat + ((Value_Perc * query.Amount ) / 100)
                if (query.Customer.BearsFee == true){
                    ChargeAmount = query.Amount + AppliedFeeValue
                }else{
                    ChargeAmount = query.Amount
                }
                SettledAmount = ChargeAmount - AppliedFeeValue
                res.status(200).send({
                    AppliedFeeID: Fee_Config.FEE_ID,
                    AppliedFeeValue: AppliedFeeValue,
                    ChargeAmount: ChargeAmount,
                    SettlementAmount: SettledAmount
                }) 
            }
         }
    }else{
        if (Fee_Config.FEE_TYPE !== "FLAT_PERC") {
            if (Fee_Config.FEE_TYPE !== "FLAT"){
                if (Fee_Config.FEE_TYPE !== "PERC"){
                    return res.status(500).send({Error: "Something went Wrong"})
                }else{
                    Value = Number(Fee_Config.FEE_VALUE)
                    AppliedFeeValue = ((Value * query.Amount ) / 100)
                    if (query.Customer.BearsFee == true){
                        ChargeAmount = query.Amount + AppliedFeeValue
                    }else{
                        ChargeAmount = query.Amount
                    }
                    SettledAmount = ChargeAmount - AppliedFeeValue
                    res.status(200).send({
                        AppliedFeeID: Fee_Config.FEE_ID,
                        AppliedFeeValue: AppliedFeeValue,
                        ChargeAmount: ChargeAmount,
                        SettlementAmount: SettledAmount
                    })
                }
            }else{
                Value = Number(Fee_Config.FEE_VALUE)
                AppliedFeeValue = Value
                if (query.Customer.BearsFee == true){
                    ChargeAmount = query.Amount + AppliedFeeValue
                }else{
                    ChargeAmount = query.Amount
                }
                SettledAmount = ChargeAmount - AppliedFeeValue
                res.status(200).send({
                    AppliedFeeID: Fee_Config.FEE_ID,
                    AppliedFeeValue: AppliedFeeValue,
                    ChargeAmount: ChargeAmount,
                    SettlementAmount: SettledAmount
                }) 
            }
        }else{
            Arr = Fee_Config.FEE_VALUE.split(":")
            Value_Flat = Number(Arr[0])
            Value_Perc = Number(Arr[1])
            AppliedFeeValue = Value_Flat + ((Value_Perc * query.Amount ) / 100)
            if (query.Customer.BearsFee == true){
                ChargeAmount = query.Amount + AppliedFeeValue
            }else{
                ChargeAmount = query.Amount
            }
            SettledAmount = ChargeAmount - AppliedFeeValue
            res.status(200).send({
                AppliedFeeID: Fee_Config.FEE_ID,
                AppliedFeeValue: AppliedFeeValue,
                ChargeAmount: ChargeAmount,
                SettlementAmount: SettledAmount
            }) 
        }
     }
})
const port = process.env.PORT || 5000

app.listen(port, () => {
    console.log(`Magic at port ${port}`)
  })