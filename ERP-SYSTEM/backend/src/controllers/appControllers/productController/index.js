const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const mongoose = require('mongoose');
const axios = require('axios');
const Invoice = mongoose.model('Invoice');
const Product = mongoose.model('Product');
const methods = createCRUDController('Product');

const AI_SERVICE_URL = 'http://localhost:8050';

methods.getAiPriceSuggestion = async (req, res) => {
  try {
    const { base_price, demand, competitor_price } = req.body;
    
    const response = await axios.post(`${AI_SERVICE_URL}/price-suggestion`, {
      base_price: base_price || 0,
      demand: demand || 'medium',
      competitor_price: competitor_price || null
    });

    return res.status(200).json({
      success: true,
      result: response.data
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'AI Service error: ' + error.message
    });
  }
};

methods.getPredictiveStockAlerts = async (req, res) => {
  try {
    // 1. Get sales from last 30 days to calculate velocity
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesStats = await Invoice.aggregate([
      { $match: { date: { $gte: thirtyDaysAgo }, removed: false } },
      { $unwind: "$items" },
      { $group: { _id: "$items.itemName", totalSold: { $sum: "$items.quantity" } } }
    ]);

    // 2. Map velocity (units per day)
    const velocityMap = {};
    salesStats.forEach(item => {
      velocityMap[item._id] = item.totalSold / 30;
    });

    // 3. Check current stock and predict run-out date
    const products = await Product.find({ removed: false });
    const alerts = [];

    products.forEach(product => {
      const velocity = velocityMap[product.name] || 0;
      const currentStock = product.quantity || product.stockQuantity || 0;
      
      if (velocity > 0) {
        const daysRemaining = currentStock / velocity;
        if (daysRemaining <= 7) {
          alerts.push({
            productId: product._id,
            productName: product.name,
            currentStock,
            velocity: velocity.toFixed(2),
            daysRemaining: Math.ceil(daysRemaining),
            severity: daysRemaining <= 3 ? 'critical' : 'warning'
          });
        }
      } else if (currentStock <= 5) {
        // Fallback for low stock even if no recent sales
        alerts.push({
          productId: product._id,
          productName: product.name,
          currentStock,
          velocity: 0,
          daysRemaining: 'N/A',
          severity: 'warning'
        });
      }
    });

    return res.status(200).json({
      success: true,
      result: alerts.sort((a, b) => (a.daysRemaining === 'N/A' ? 100 : a.daysRemaining) - (b.daysRemaining === 'N/A' ? 100 : b.daysRemaining))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = methods;
