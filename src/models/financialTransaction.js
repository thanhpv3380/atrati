const mongoose = require('mongoose');
const { FINANCIAL_TRANSACTION_TYPE } = require('../constants');

const { ObjectId } = mongoose.Types;

const schema = new mongoose.Schema(
  {
    date: Date,
    type: {
      type: String,
      enum: FINANCIAL_TRANSACTION_TYPE,
    },
    description: String,
    amount: Number,
    userId: {
      type: ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('FinancialTransaction', schema);
