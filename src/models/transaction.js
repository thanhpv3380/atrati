const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../constants');

const { ObjectId } = mongoose.Types;

const schema = new mongoose.Schema(
  {
    date: Date,
    description: String,
    amount: Number,
    status: {
      type: String,
      enum: PAYMENT_STATUS,
    },
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

module.exports = mongoose.model('Transaction', schema);
