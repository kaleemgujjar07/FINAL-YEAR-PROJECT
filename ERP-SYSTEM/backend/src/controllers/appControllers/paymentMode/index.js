const mongoose = require('mongoose');
const Model = mongoose.model('PaymentMode');

const crudController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = crudController('PaymentMode');

delete methods['update'];

methods.update = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Model.findOneAndUpdate({ _id: id }, req.body, {
      new: true,
    }).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'we update this document by this id: ' + id,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      result: null,
      message: 'Oops there is an Error',
      error: err,
    });
  }
};

module.exports = methods;
