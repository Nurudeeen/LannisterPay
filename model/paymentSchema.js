const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// create user Schema & model
const FCSSchema = new Schema({
    FEE_ID: {
        type: String,
       
    },
    FEE_CURRENCY: {
        type: String
    },
    FEE_LOCALE: {
        type: String
    },
    FEE_ENTITY: {
        type: String
    }, 
    ENTITY_PROPERTY: { 
        type: String 
    },
    FEE_TYPE: { 
        type: String 
    },
    FEE_VALUE: { 
        type: String 
    },
    AccessedAt: { 
        type: Date, default: Date.now()
     },

   
    
});

const FCS = mongoose.model('Fee_Config_Spec', FCSSchema);

module.exports = FCS;