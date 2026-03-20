const create = async (Model, req, res) => {
  // Creating a new document in the collection
  req.body.removed = false;
  req.body.createdBy = req.admin._id;
  try {
    const fs = require('fs');
    const logData = `--- Generic Create ---\nModel: ${Model.modelName}\nBody: ${JSON.stringify(req.body, null, 2)}\n\n`;
    fs.appendFileSync('backend_debug.log', logData);
  } catch (e) {
    console.error('Failed to log to file:', e);
  }
  const result = await new Model({
    ...req.body,
  }).save();

  // Returning successfull response
  return res.status(200).json({
    success: true,
    result,
    message: 'Successfully Created the document in Model ',
  });
};

module.exports = create;
