const mongoose = require('mongoose');
const ZaloMessage = require('../models/zaloMessage');
const { findAll } = require('./utils/util');

const { ObjectId } = mongoose.Types;

const findZaloMessages = async ({ limit, page, hasPagination } = {}, attributes) => {
  const filters = {};

  const result = await findAll({
    model: ZaloMessage,
    filters,
    hasPagination,
    limit,
    page,
    attributes,
  });

  return result;
};

const findZaloMessage = async (query) => {
  if (ObjectId.isValid(query)) {
    const item = await ZaloMessage.findById(query);
    return item;
  }

  if (query && typeof query === 'object') {
    const item = await ZaloMessage.findOne(query);
    return item;
  }

  return null;
};

const createZaloMessage = async (data) => {
  const item = await ZaloMessage.create(data);
  return item;
};

const updateZaloMessage = async (query, data) => {
  await ZaloMessage.findOneAndUpdate(query, data);
};

const deleteZaloMessage = async (query) => {
  await ZaloMessage.deleteOne(query);
};

module.exports = {
  findZaloMessages,
  findZaloMessage,
  createZaloMessage,
  updateZaloMessage,
  deleteZaloMessage,
};
