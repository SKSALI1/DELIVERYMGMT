const mongoose = require('mongoose');
const csvSchema = new mongoose.Schema({
    date: String,
    billNumber: String,
    name: String,
    amount: String,
    deliveredBy:String,
    assignedBarcode:String,
    isPacked:{
      type:Boolean,
      default:false
    },
    isDelivered : {
      type:Boolean,
      default:false
    },
    isPaid:{
      type:Boolean,
      default:false
    },
    isReturned:{
      type:Boolean,
      default:false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  const CsvModel = mongoose.model('CsvData', csvSchema);

  module.exports = CsvModel;