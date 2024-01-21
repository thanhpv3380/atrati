const mongoose = require('mongoose');
const FinancialTransaction = require('../models/financialTransaction');
const { findAll } = require('./utils/util');

const { ObjectId } = mongoose.Types;

const findFinancialTransactions = async (
  { limit, page, hasPagination, userId, userIds, type, startTime, endTime, sort } = {},
  isPopulate,
  attributes,
) => {
  const filters = {};
  if (userIds) filters.userId = { $in: userIds.split(',') };
  if (userId) filters.userId = userId;
  if (type) filters.type = type;

  const dateFilters = {};
  if (startTime) dateFilters.$gte = new Date(startTime);
  if (endTime) dateFilters.$lte = new Date(endTime);
  if (dateFilters && Object.keys(dateFilters).length > 0) filters.date = dateFilters;

  const result = await findAll({
    model: FinancialTransaction,
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
    sort,
  });

  return result;
};

const findFinancialTransaction = async (query, isPopulate) => {
  if (ObjectId.isValid(query)) {
    const item = await FinancialTransaction.findById(query).populate(
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
    const item = await FinancialTransaction.findOne(query).populate(
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

const createFinancialTransaction = async (data) => {
  const item = await FinancialTransaction.create(data);
  return item;
};

const createManyFinancialTransaction = async (data) => {
  const items = await FinancialTransaction.insertMany(data);
  return items;
};

const updateFinancialTransaction = async (query, data) => {
  await FinancialTransaction.findOneAndUpdate(query, data);
};

const updateManyFinancialTransaction = async (query, data) => {
  await FinancialTransaction.updateMany(query, data);
};

const deleteFinancialTransaction = async (query) => {
  await FinancialTransaction.deleteOne(query);
};

module.exports = {
  findFinancialTransactions,
  findFinancialTransaction,
  createFinancialTransaction,
  createManyFinancialTransaction,
  updateFinancialTransaction,
  updateManyFinancialTransaction,
  deleteFinancialTransaction,
};
