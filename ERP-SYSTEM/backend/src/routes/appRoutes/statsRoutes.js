const express = require('express');
const router = express.Router();
const statsController = require('@/controllers/appControllers/statsController');
const { catchErrors } = require('@/handlers/errorHandlers');

router.route('/revenue-forecast').get(catchErrors(statsController.revenueForecast));
router.route('/expense-forecast').get(catchErrors(statsController.expenseForecast));
router.route('/insights').get(catchErrors(statsController.getInsights));

module.exports = router;
