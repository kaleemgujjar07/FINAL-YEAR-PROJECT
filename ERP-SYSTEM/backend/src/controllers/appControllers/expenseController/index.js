const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const methods = createCRUDController('Expense');
const summary = require('./summary');

methods.summary = summary;

module.exports = methods;
