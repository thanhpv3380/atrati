const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    rawMessage: Object,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('ZaloMessage', schema);
