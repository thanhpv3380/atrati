const mongoose = require('mongoose');

const Counter = require('./counter');

const schema = new mongoose.Schema(
  {
    name: String,
    code: Number,
    telegramId: String,
    telegramLanguage: String,
    role: String,
    paidAmount: Number,
    unpaidAmount: Number,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

schema.pre('save', async function (next) {
  try {
    const counter = await Counter.findByIdAndUpdate('userCode', {
      $inc: { seq: 1 },
    });
    this.code = `${counter.seq}`;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', schema);
