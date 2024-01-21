const findAll = async ({
  model,

  filters = {},
  hasPagination = false,
  limit = Number.MAX_SAFE_INTEGER,
  page = 1,

  populate = [],
  sort = {},
}) => {
  const options = {};

  const items = await model
    .find(filters, options)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate(
      populate.map((el) => {
        const item = {
          path: el.path,
          select: el.attributes ? el.attributes.join(' ') : '',
        };

        if (el.model) item.model = el.model;
        if (el.options) item.options = el.options;
        if (el.as) item.as = el.as;
        return item;
      }),
    )
    .sort(sort)
    .lean();

  let pagination;
  if (hasPagination) {
    const totalItem = await model.countDocuments(filters);
    pagination = getPagination({ totalItem, page, limit });
  }

  return { items, pagination };
};

const getPagination = ({ totalItem, page, limit }) => {
  return {
    page,
    limit,
    totalCount: totalItem,
    totalPage: Math.ceil(totalItem / limit),
  };
};

module.exports = { findAll, getPagination };
