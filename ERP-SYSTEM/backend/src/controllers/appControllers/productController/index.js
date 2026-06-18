const createCRUDController = require('@/controllers/middlewaresControllers/createCRUDController');
const mongoose = require('mongoose');
const axios = require('axios');
const Invoice = mongoose.model('Invoice');
const Product = mongoose.model('Product');
const methods = createCRUDController('Product');

const AI_SERVICE_URL = 'http://localhost:8050';
const ECOMMERCE_API_URL = process.env.ECOMMERCE_API_URL || 'http://localhost:8000';

const safeString = (value, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;

const mapEcommerceProductPayload = (product) => {
  const title = safeString(product.title || product.name, 'Untitled Product');
  const description = safeString(product.description, title);
  const price = Number(product.price || 0);
  const stockQuantity = Number(product.quantity ?? product.stockQuantity ?? 0);
  const thumbnail = safeString(product.thumbnail, 'https://via.placeholder.com/300x300?text=No+Image');
  const images = Array.isArray(product.images) && product.images.length ? product.images : [thumbnail];
  const category = safeString(product.category, 'Uncategorized');
  const brand = safeString(product.brand?.name || product.brand || product.brandName, 'Generic');

  return {
    erpProductId: String(product._id),
    title,
    description,
    price,
    stockQuantity,
    thumbnail,
    images,
    discountPercentage: Number(product.discountPercentage ?? 0),
    category,
    brand,
    isDeleted: Boolean(product.removed || product.isDeleted),
  };
};

const syncProductToEcommerce = async (product) => {
  try {
    const payload = mapEcommerceProductPayload(product);
    await axios.post(`${ECOMMERCE_API_URL}/products/sync`, payload, { timeout: 10000 });
    console.log('ERP product synced to ecommerce:', product._id);
  } catch (error) {
    console.error('ERP -> Ecommerce sync failed:', error.message);
    if (error.response) {
      console.error('Sync response:', error.response.status, JSON.stringify(error.response.data));
    }
  }
};

methods.create = async (req, res) => {
  try {
    req.body.removed = false;
    req.body.createdBy = req.admin._id;
    const created = await new Product({ ...req.body }).save();
    syncProductToEcommerce(created);
    return res.status(200).json({ success: true, result: created, message: 'Successfully Created the document in Model' });
  } catch (error) {
    console.error('ERP Product create failed:', error);
    return res.status(500).json({ success: false, result: null, message: 'Error creating product' });
  }
};

methods.update = async (req, res) => {
  try {
    req.body.removed = false;
    if (req.body.createdBy) delete req.body.createdBy;
    const result = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        removed: false,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).exec();

    if (!result) {
      return res.status(404).json({ success: false, result: null, message: 'No document found' });
    }

    syncProductToEcommerce(result);
    return res.status(200).json({ success: true, result, message: 'we update this document' });
  } catch (error) {
    console.error('ERP Product update failed:', error);
    return res.status(500).json({ success: false, result: null, message: 'Error updating product' });
  }
};

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
