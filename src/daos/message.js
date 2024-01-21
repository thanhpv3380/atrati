const mongoose = require('mongoose');
const Message = require('../models/message');
const { findAll } = require('./utils/util');

const { ObjectId } = mongoose.Types;

const findMessages = async ({ limit, page, hasPagination } = {}, attributes) => {
  const filters = {};

  const result = await findAll({
    model: Message,
    filters,
    hasPagination,
    limit,
    page,
    attributes,
  });

  return result;
};

const findMessage = async (query) => {
  if (ObjectId.isValid(query)) {
    const item = await Message.findById(query);
    return item;
  }

  if (query && typeof query === 'object') {
    const item = await Message.findOne(query);
    return item;
  }

  return null;
};

const createMessage = async (data) => {
  const item = await Message.create(data);
  return item;
};

const updateMessage = async (query, data) => {
  await Message.findOneAndUpdate(query, data);
};

const deleteMessage = async (query) => {
  await Message.deleteOne(query);
};

module.exports = {
  findMessages,
  findMessage,
  createMessage,
  updateMessage,
  deleteMessage,
};
