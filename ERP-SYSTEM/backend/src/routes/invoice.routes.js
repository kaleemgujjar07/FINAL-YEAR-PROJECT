const express = require('express');
const { createInvoiceFromEcommerce } = require('../controllers/invoice.controller');
const internalAuth = require('../middlewares/internalAuth');

const router = express.Router();

router.post(
  '/from-ecommerce',
  internalAuth,
  createInvoiceFromEcommerce
);

module.exports = router;
