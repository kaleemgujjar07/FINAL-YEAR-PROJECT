const express = require('express');
const router = express.Router();
const assistantController = require('../../controllers/appControllers/assistantController');
const { catchErrors } = require('../../handlers/errorHandlers');

router.post('/query', catchErrors(assistantController.query));

module.exports = router;
