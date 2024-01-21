const mongoose = require('mongoose');

const countSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 1 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model('Counter', countSchema);
