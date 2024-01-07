const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../constants');

const { ObjectId } = mongoose.Types;

const schema = new mongoose.Schema(
  {
    date: String,
    description: String,
    money: Number,
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
