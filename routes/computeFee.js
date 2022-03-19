const express = require ('express');
const compute = express.Router();
const FCS = require("../model/paymentSchema")

compute.post('/compute-transaction-fee',  async (req, res) => {
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

module.exports = compute;