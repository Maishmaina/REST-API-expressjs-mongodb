const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  //copy req.Query
  const reqQuery = { ...req.query };
  //field to exlcude
  const removeFields = ["select", "sort", "page", "limit"];
  //loop over removedFIelds and delete from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  //console.log(reqQuery);

  //createQuery String
  let queryStr = JSON.stringify(reqQuery);
  //create operators ie $gt, $lt,etc
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  //finding resources
  query = model.find(JSON.parse(queryStr));

  //Select Field
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }
  //Pagenation
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;

  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);
  if (populate) {
    query = query.populate(populate);
  }
  //executing query
  const results = await query;
  //Pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};
module.exports = advancedResults;
