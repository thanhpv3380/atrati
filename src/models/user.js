const mongoose = require('mongoose');

const schema = new mongoose.Schema(
  {
    name: String,
    zaloId: String,
    code: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('User', schema);
