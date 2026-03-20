const mongoose = require('mongoose');
const axios = require('axios');

const Invoice = mongoose.model('Invoice');
const Product = mongoose.model('Product');
const Employee = mongoose.model('Employee');
const Expense = mongoose.model('Expense');

const AI_SERVICE_URL = 'http://localhost:8050';

const assistantController = {
  query: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required',
        });
      }

      // 1. Ask the Python AI Service for the intent
      let aiResponse;
      try {
        aiResponse = await axios.post(`${AI_SERVICE_URL}/assistant/process`, { message });
      } catch (err) {
        console.error('AI Service Error:', err.message);
        return res.status(200).json({
            success: true,
            result: "I'm having trouble connecting to my brain (AI Service). Please make sure it's running!"
        });
      }

      const { intent, entities } = aiResponse.data;
      let resultMessage = "";
      const { month, year } = entities || {};

      switch (intent) {
        case 'get_sales_summary': {
          let query = { removed: false };
          if (year) query.year = year;
          if (month) {
             const start = new Date(year || new Date().getFullYear(), month - 1, 1);
             const end = new Date(year || new Date().getFullYear(), month, 1);
             query.date = { $gte: start, $lt: end };
          }
          const invoices = await Invoice.find(query);
          const totalSales = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
          const periodText = month && year ? `for ${month}/${year}` : (year ? `for year ${year}` : "total");
          resultMessage = `Total revenue ${periodText} from ${invoices.length} invoices is ${totalSales.toFixed(2)}.`;
          break;
        }

        case 'get_inventory_status': {
          const lowStock = await Product.find({ $or: [{ quantity: { $lte: 5 } }, { stockQuantity: { $lte: 5 } }], removed: false });
          if (lowStock.length > 0) {
            resultMessage = `You have ${lowStock.length} items low on stock: ${lowStock.slice(0, 3).map(p => p.name || p.title).join(', ')}...`;
          } else {
            resultMessage = "All your products are currently well-stocked!";
          }
          break;
        }

        case 'get_hr_summary': {
          const employees = await Employee.find({ removed: false });
          resultMessage = `You have a total of ${employees.length} employees registered in the system.`;
          break;
        }

        case 'get_expense_summary': {
          let query = { removed: false };
          if (year) {
             const start = new Date(year, month ? month - 1 : 0, 1);
             const end = new Date(year, month ? month : 12, 1);
             query.date = { $gte: start, $lt: end };
          }
          const expenses = await Expense.find(query);
          const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
          const periodText = month && year ? `for ${month}/${year}` : (year ? `for ${year}` : "recorded");
          resultMessage = `Total expenses ${periodText}: ${totalExpenses.toFixed(2)}.`;
          break;
        }

        default:
          resultMessage = "I understood your message, but I don't have a specific data query for that yet. I'm still learning!";
      }

      return res.status(200).json({
        success: true,
        result: resultMessage,
        ai_data: aiResponse.data
      });

    } catch (error) {
      console.error('Assistant Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = assistantController;
