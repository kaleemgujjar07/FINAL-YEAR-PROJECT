const mongoose = require('mongoose');
const axios = require('axios');
const Invoice = mongoose.model('Invoice');
const Expense = mongoose.model('Expense');
const Product = mongoose.model('Product');

const AI_SERVICE_URL = 'http://localhost:8050';

const statsController = {
  revenueForecast: async (req, res) => {
    try {
      const result = await Invoice.aggregate([
        { $match: { removed: false } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            totalRevenue: { $sum: '$total' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const historicalData = result.map((item) => item.totalRevenue);
      const labels = result.map((item) => `${item._id.month}/${item._id.year}`);

      if (historicalData.length < 2) {
        const mockHistorical = [1200, 1500, 1800, 1600, 2100, 2400];
        const mockLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        try {
          const aiResponse = await axios.post(`${AI_SERVICE_URL}/forecast/series`, { historical_data: mockHistorical, steps: 6 });
          return res.status(200).json({ success: true, actual: mockHistorical, forecast: aiResponse.data.forecasts, labels: [...mockLabels, 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], trend: aiResponse.data.trend, isMock: true });
        } catch (e) {
          return res.status(200).json({ success: true, actual: mockHistorical, forecast: [2500, 2600, 2700, 2800, 2900, 3000], labels: [...mockLabels, 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], trend: 'increasing', isMock: true });
        }
      }

      const forecastLabels = [];
      let lastDate = new Date(result[result.length - 1]._id.year, result[result.length - 1]._id.month, 1);
      for (let i = 1; i <= 6; i++) {
        let nextMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
        forecastLabels.push(`${nextMonth.getMonth() + 1}/${nextMonth.getFullYear()}`);
      }

      let aiResponse;
      try {
        aiResponse = await axios.post(`${AI_SERVICE_URL}/forecast/series`, { historical_data: historicalData, steps: 6 });
        return res.status(200).json({ success: true, actual: historicalData, forecast: aiResponse.data.forecasts, labels: [...labels, ...forecastLabels], trend: aiResponse.data.trend, isMock: false });
      } catch (aiError) {
        console.error('AI Service Error (Revenue):', aiError.message);
        return res.status(200).json({ 
          success: true, 
          actual: historicalData, 
          forecast: new Array(6).fill(historicalData[historicalData.length - 1] || 0), 
          labels: [...labels, ...forecastLabels], 
          trend: 'stable', 
          isMock: false,
          aiError: true 
        });
      }
    } catch (error) {
      console.error('Revenue Forecast Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  expenseForecast: async (req, res) => {
    try {
      const result = await Expense.aggregate([
        { $match: { removed: false } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            totalExpense: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]);

      const historicalData = result.map((item) => item.totalExpense);
      const labels = result.map((item) => `${item._id.month}/${item._id.year}`);

      if (historicalData.length < 2) {
        const mockHistorical = [800, 700, 900, 850, 1000, 950];
        const mockLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        try {
          const aiResponse = await axios.post(`${AI_SERVICE_URL}/forecast/series`, { historical_data: mockHistorical, steps: 6 });
          return res.status(200).json({ success: true, actual: mockHistorical, forecast: aiResponse.data.forecasts, labels: [...mockLabels, 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], trend: aiResponse.data.trend, isMock: true });
        } catch (e) {
          return res.status(200).json({ success: true, actual: mockHistorical, forecast: [1000, 1050, 1100, 1150, 1200, 1250], labels: [...mockLabels, 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], trend: 'stable', isMock: true });
        }
      }

      const forecastLabels = [];
      let lastDate = new Date(result[result.length - 1]._id.year, result[result.length - 1]._id.month, 1);
      for (let i = 1; i <= 6; i++) {
        let nextMonth = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
        forecastLabels.push(`${nextMonth.getMonth() + 1}/${nextMonth.getFullYear()}`);
      }

      let aiResponse;
      try {
        aiResponse = await axios.post(`${AI_SERVICE_URL}/forecast/series`, { historical_data: historicalData, steps: 6 });
        return res.status(200).json({ success: true, actual: historicalData, forecast: aiResponse.data.forecasts, labels: [...labels, ...forecastLabels], trend: aiResponse.data.trend, isMock: false });
      } catch (aiError) {
        console.error('AI Service Error (Expense):', aiError.message);
        return res.status(200).json({ 
          success: true, 
          actual: historicalData, 
          forecast: new Array(6).fill(historicalData[historicalData.length - 1] || 0), 
          labels: [...labels, ...forecastLabels], 
          trend: 'stable', 
          isMock: false,
          aiError: true 
        });
      }
    } catch (error) {
      console.error('Expense Forecast Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  },

  getInsights: async (req, res) => {
    try {
      // Fetch both revenue and expense trends
      const revResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/stats/revenue-forecast`, { headers: req.headers });
      const expResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/stats/expense-forecast`, { headers: req.headers });

      const revTrend = revResponse.data.trend || 'stable';
      const expTrend = expResponse.data.trend || 'stable';

      let insights = [];
      
      // 1. Live Operational Insights
      const lowStockCount = await Product.countDocuments({ quantity: { $lt: 10 }, removed: false });
      if (lowStockCount > 0) {
        insights.push({ title: 'Inventory Alert', text: `You have ${lowStockCount} products running low on stock. Consider reordering soon.`, color: 'red' });
      }

      const pendingInvoices = await Invoice.countDocuments({ status: 'pending', removed: false });
      if (pendingInvoices > 0) {
        insights.push({ title: 'Cash Flow Notice', text: `There are ${pendingInvoices} pending invoices. Follow up to improve cash flow.`, color: 'blue' });
      }

      // 2. Trend Forecast Insights
      if (revTrend === 'increasing' && expTrend === 'decreasing') {
        insights.push({ title: 'Profit Expansion', text: 'AI predicts record profits! High revenue growth combined with cost savings.', color: 'green' });
      } else if (revTrend === 'increasing' && expTrend === 'increasing') {
        insights.push({ title: 'Scaling Alert', text: 'Business is growing fast, but expenses are rising too. Monitor your overheads.', color: 'blue' });
      } else if (revTrend === 'decreasing') {
        insights.push({ title: 'Revenue Risk', text: 'AI detected a downward trend in sales. Consider promotional campaigns.', color: 'red' });
      } else if (insights.length === 0) {
        insights.push({ title: 'Stable Outlook', text: 'The business is maintaining a steady performance. Focus on efficiency.', color: 'gray' });
      }

      return res.status(200).json({ success: true, insights });
    } catch (error) {
      console.error('Insights Error:', error);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = statsController;
