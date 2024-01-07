const mongoose = require('mongoose');
const User = require('../models/user');
const { findAll } = require('./utils/util');

const { ObjectId } = mongoose.Types;

const findUsers = async ({ limit, page, hasPagination, searchKey } = {}, attributes) => {
  const filters = {};
  if (searchKey) filters.name = { $regex: new RegExp(searchKey) };

  const result = await findAll({
    model: User,
    filters,
    hasPagination,
    limit,
    page,
    attributes,
  });

  return result;
};

const findUser = async (query) => {
  if (ObjectId.isValid(query)) {
    const item = await User.findById(query);
    return item;
  }

  if (query && typeof query === 'object') {
    const item = await User.findOne(query);
    return item;
  }

  return null;
};

const createUser = async (data) => {
  const item = await User.create(data);
  return item;
};

const updateUser = async (query, data) => {
  await User.findOneAndUpdate(query, data);
};

const deleteUser = async (query) => {
  await User.deleteOne(query);
};

module.exports = {
  findUsers,
  findUser,
  createUser,
  updateUser,
  deleteUser,
};
