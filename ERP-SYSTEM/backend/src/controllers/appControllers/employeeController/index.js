const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Employee');
const summary = require('./summary');

methods.summary = summary;

module.exports = methods;
