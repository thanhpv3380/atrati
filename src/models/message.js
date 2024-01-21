const mongoose = require('mongoose');
const { MESSAGE_STATUS } = require('../constants');

const schema = new mongoose.Schema(
  {
    date: Date,
    messageReq: Object,
    messageRes: Object,
    status: {
      type: String,
      enum: MESSAGE_STATUS,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Message', schema);
