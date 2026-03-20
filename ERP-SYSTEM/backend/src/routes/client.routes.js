const express = require('express');
const { createClientFromEcommerce } = require('../controllers/client.controller');
const internalAuth = require('../middlewares/internalAuth');

const router = express.Router();

router.post(
  '/from-ecommerce',
  internalAuth,
  createClientFromEcommerce
);

module.exports = router;
