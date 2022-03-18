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
      const f = line.search ("FLAT_PERC")
      if(f==-1){const p = line.search ("PERC")
  if (p==-1){
      const g = line.search ("FLAT")
      if (g==-1) {
          console.log("Error in input")
      }else{
          FEE_TYPE ="FLAT"
          FEE_VALUE = line.slice(-3)
      }
  }else{
      FEE_TYPE ="PERC"
      FEE_VALUE = line.slice(-4)
  }}else{ FEE_TYPE ="FLAT_PERC"
      FEE_VALUE = line.slice(-6)
  }
  const LOCL = line.search("LOCL")
  if (LOCL==-1){
      const INTL = line.search("INTL")
      if(INTL==-1){
          FEE_LOCALE="*"
      }else{
          FEE_LOCALE="INTL"
      }
  }else{
      FEE_LOCALE="LOCL"
  }
  const WALLET = line.search("WALLET-ID")
  if (WALLET==-1){
      const USSD = line.search("USSD")
      if (USSD==-1){
          const DEBIT = line.search("DEBIT-CARD")
          if (DEBIT==-1){
              const CREDIT = line.search("CREDIT-CARD")
              if (CREDIT==-1){
                  const ACCOUNT = line.search("BANK-ACCOUNT")
                  if (ACCOUNT==-1){
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
  const MTN = line.search("MTN")
  if(MTN==-1){
      const GLO = line.search("GLO")
      if (GLO==-1){
          const AIRTEL = line.search("AIRTEL")
          if (AIRTEL==-1){
              const VERVE = line.search("VERVE")
              if (VERVE==-1){
                  const MASTERCARD =line.search("MASTERCARD")
                  if (MASTERCARD==-1){
                      const VISA = line.search("VISA")
                      if (VISA==-1){
                          const AMEX = line.search("AMEX")
                          if (AMEX==-1){
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