const express = require('express');
const { syncOrder } = require('../controllers/sync.controller');
const internalAuth = require('../middlewares/internalAuth');

const router = express.Router();

router.post(
  '/order',
  internalAuth,
  syncOrder
);

module.exports = router;
