const mongoose = require('mongoose');
const moment = require('moment');

const Model = mongoose.model('Attendance');

const summary = async (req, res) => {
  const today = moment().startOf('day');

  const countAllDocs = await Model.countDocuments({ removed: false });
  const countFilter = await Model.countDocuments({
    removed: false,
    status: 'Present',
    date: {
      $gte: today.toDate(),
      $lte: moment(today).endOf('day').toDate(),
    },
  });

  const performanceResult = await Model.aggregate([
    { $match: { removed: false, date: { $gte: today.toDate() } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const performance = performanceResult.map((item) => ({
    status: item._id,
    count: item.count,
    percentage: countAllDocs > 0 ? Math.round((item.count / countAllDocs) * 100) : 0,
  }));

  return res.status(200).json({
    success: true,
    result: {
      countAllDocs,
      countFilter,
      performance,
    },
    message: `Successfully found attendance summary`,
  });
};

module.exports = summary;
