const mongoose = require('mongoose');
const Transaction = require('../models/transaction');
const { findAll } = require('./utils/util');

const { ObjectId } = mongoose.Types;

const findTransactions = async (
  { limit, page, hasPagination, userId, userIds, status, startTime, endTime } = {},
  isPopulate,
  attributes,
) => {
  const filters = {};
  if (userIds) filters.userId = { $in: userIds.split(',') };
  if (userId) filters.userId = userId;

  if (status) {
    filters.status = { $in: status.split(',') };
  }

  const dateFilters = {};
  if (startTime) dateFilters.$gte = new Date(startTime);
  if (endTime) dateFilters.$lte = new Date(endTime);
  if (dateFilters && Object.keys(dateFilters).length > 0) filters.date = dateFilters;

  const result = await findAll({
    model: Transaction,
    populate: isPopulate
      ? [
          {
            path: 'userId',
            attributes: ['id', 'name', 'code', 'role', 'telegramId'],
          },
        ]
      : [],
    filters,
    hasPagination,
    limit,
    page,
    attributes,
  });

  return result;
};

const findTransaction = async (query, isPopulate) => {
  if (ObjectId.isValid(query)) {
    const item = await Transaction.findById(query).populate(
      isPopulate
        ? [
            {
              path: 'userId',
              select: ['id', 'name', 'code', 'role', 'telegramId'].join(' '),
            },
          ]
        : [],
    );
    return item;
  }

  if (query && typeof query === 'object') {
    const item = await Transaction.findOne(query).populate(
      isPopulate
        ? [
            {
              path: 'createdBy',
              select: ['id', 'name', 'code', 'role', 'telegramId'].join(' '),
            },
          ]
        : [],
    );
    return item;
  }

  return null;
};

const createTransaction = async (data) => {
  const item = await Transaction.create(data);
  return item;
};

const createManyTransaction = async (data) => {
  const items = await Transaction.insertMany(data);
  return items;
};

const updateTransaction = async (query, data) => {
  await Transaction.findOneAndUpdate(query, data);
};

const updateManyTransaction = async (query, data) => {
  await Transaction.updateMany(query, data);
};

const deleteTransaction = async (query) => {
  await Transaction.deleteOne(query);
};

module.exports = {
  findTransactions,
  findTransaction,
  createTransaction,
  createManyTransaction,
  updateTransaction,
  updateManyTransaction,
  deleteTransaction,
};
