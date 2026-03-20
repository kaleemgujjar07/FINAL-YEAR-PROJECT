const mongoose = require('mongoose');
const moment = require('moment');

const Model = mongoose.model('Expense');

const summary = async (req, res) => {
  const currentDate = moment();
  let startDate = currentDate.clone().startOf('month');
  let endDate = currentDate.clone().endOf('month');

  const response = await Model.aggregate([
    {
      $match: {
        removed: false,
      },
    },
    {
      $facet: {
        totalExpense: [
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              total: '$total',
              count: '$count',
            },
          },
        ],
        categoryCounts: [
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
            },
          },
          {
            $project: {
              _id: 0,
              status: '$_id',
              count: '$count',
            },
          },
        ],
      },
    },
  ]);

  const totalExpense = response[0].totalExpense ? response[0].totalExpense[0] : { total: 0, count: 0 };
  const categoryResult = response[0].categoryCounts || [];

  const performance = categoryResult.map((item) => ({
    ...item,
    percentage: totalExpense.count > 0 ? Math.round((item.count / totalExpense.count) * 100) : 0,
  }));

  return res.status(200).json({
    success: true,
    result: {
      total: totalExpense.total,
      countAllDocs: totalExpense.count,
      performance: performance,
    },
    message: `Successfully found all expenses summary`,
  });
};

module.exports = summary;
