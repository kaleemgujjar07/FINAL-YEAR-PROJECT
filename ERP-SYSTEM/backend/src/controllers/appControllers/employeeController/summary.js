const mongoose = require('mongoose');

const Model = mongoose.model('Employee');

const summary = async (req, res) => {
  const countAllDocs = await Model.countDocuments({ removed: false });
  
  const statusStats = await Model.aggregate([
    { $match: { removed: false } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const performance = statusStats.map(item => ({
    status: item._id,
    count: item.count,
    percentage: countAllDocs > 0 ? Math.round((item.count / countAllDocs) * 100) : 0
  }));

  return res.status(200).json({
    success: true,
    result: {
      countAllDocs,
      performance
    },
    message: 'Successfully found employee summary'
  });
};

module.exports = summary;
