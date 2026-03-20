const fs = require('fs');
const path = require('path');

const dirs = [
  'src/controllers/coreControllers',
  'src/routes/coreRoutes',
  'src/routes/appRoutes',
  'src/handlers',
  'src/models'
];

dirs.forEach(d => {
  fs.mkdirSync(path.join(__dirname, d), { recursive: true });
});

// Basic Express router
const routerBoilerplate = `const express = require('express');\nconst router = express.Router();\n\nmodule.exports = router;`;

fs.writeFileSync('src/routes/coreRoutes/coreAuth.js', routerBoilerplate);
fs.writeFileSync('src/routes/coreRoutes/coreApi.js', routerBoilerplate);
fs.writeFileSync('src/routes/coreRoutes/coreDownloadRouter.js', routerBoilerplate);
fs.writeFileSync('src/routes/coreRoutes/corePublicRouter.js', routerBoilerplate);
fs.writeFileSync('src/routes/client.routes.js', routerBoilerplate);
fs.writeFileSync('src/routes/sync.routes.js', routerBoilerplate);
fs.writeFileSync('src/routes/appRoutes/appApi.js', routerBoilerplate);

const adminAuthContent = `
exports.isValidAuthToken = (req, res, next) => {
  // basic mock auth
  next();
};
`;
fs.writeFileSync('src/controllers/coreControllers/adminAuth.js', adminAuthContent);

const errorHandlerContent = `
exports.notFound = (req, res, next) => {
  res.status(404).json({ message: 'Not Found' });
};
exports.productionErrors = (err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
};
`;
fs.writeFileSync('src/handlers/errorHandlers.js', errorHandlerContent);

// Boilerplate Mongoose models to satisfy globeSync glob pattern in server.js
const schemaBoilerplate = (name) => `const mongoose = require('mongoose');
const schema = new mongoose.Schema({ name: String }, { timestamps: true });
module.exports = mongoose.model('${name}', schema);`;

fs.writeFileSync('src/models/Inventory.js', schemaBoilerplate('Inventory'));
fs.writeFileSync('src/models/Employee.js', schemaBoilerplate('Employee'));
fs.writeFileSync('src/models/Expense.js', schemaBoilerplate('Expense'));
fs.writeFileSync('src/models/Sale.js', schemaBoilerplate('Sale'));

console.log('Boilerplate generated successfully!');
