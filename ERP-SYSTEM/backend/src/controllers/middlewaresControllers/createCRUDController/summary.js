const summary = async (Model, req, res) => {
  try {
    const fs = require('fs');
    const logData = `--- Generic Summary ---\nModel: ${Model.modelName}\nQuery: ${JSON.stringify(req.query, null, 2)}\n\n`;
    fs.appendFileSync('backend_debug.log', logData);
  } catch (e) {
    console.error('Failed to log to file:', e);
  }
  //  Query the database for a list of all results
  const countPromise = Model.countDocuments({
    removed: false,
  });

  const resultsPromise = await Model.countDocuments({
    removed: false,
  })
    .where(req.query.filter)
    .equals(req.query.equal)
    .exec();
  // Resolving both promises
  const [countFilter, countAllDocs] = await Promise.all([resultsPromise, countPromise]);

  if (countAllDocs.length > 0) {
    return res.status(200).json({
      success: true,
      result: { countFilter, countAllDocs },
      message: 'Successfully count all documents',
    });
  } else {
    return res.status(203).json({
      success: false,
      result: [],
      message: 'Collection is Empty',
    });
  }
};

module.exports = summary;
