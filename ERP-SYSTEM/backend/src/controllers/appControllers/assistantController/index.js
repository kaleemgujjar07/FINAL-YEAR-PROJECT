const mongoose = require('mongoose');
const axios = require('axios');

const Invoice = mongoose.model('Invoice');
const Product = mongoose.model('Product');
const Employee = mongoose.model('Employee');
const Expense = mongoose.model('Expense');
const Client = mongoose.model('Client');

const AI_SERVICE_URL = 'http://localhost:8050';

const assistantController = {
  query: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ success: false, message: 'Message is required' });
      }

      // 1. Get NLP Intent and Suggestion from Local AI Service
      let intent = 'unknown';
      let entities = {};
      let aiSuggestion = "";
      try {
        const aiResponse = await axios.post(`${AI_SERVICE_URL}/assistant/process`, { 
          message,
          role: 'admin' // Ensure the AI knows it's in ERP/Admin context
        });
        intent = aiResponse.data.intent;
        entities = aiResponse.data.entities || {};
        aiSuggestion = aiResponse.data.suggestion || "";
      } catch (err) {
        console.error('AI Service Error:', err.message);
        return res.status(200).json({
          success: true,
          result: "My Machine Learning engine (AI-SERVICE) is currently offline. Please start it up so I can understand you!"
        });
      }

      const { month, year } = entities;
      let resultMessage = aiSuggestion; // Default to AI's general response

      // 2. Perform Dynamic Database GROUNDING based on Local ML Intent
      // If the intent matches a hardcoded ERP report, the backend will provide specific data.
      switch (intent) {
        case 'get_system_info':
          resultMessage = "I am the Cognivio AI Assistant! 👋\nCognivio is an Intelligent Business Operating Platform that unites your Ecommerce storefront with your ERP backoffice. I can provide real-time updates on your sales, customers, inventory, and predict demand or price optimization using Machine Learning. What would you like to know?";
          break;

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
          resultMessage = `📈 **Sales Report**:\nYou have a total of **${invoices.length} invoices** ${periodText}, generating **$${totalSales.toFixed(2)}** in revenue.`;
          break;
        }

        case 'get_inventory_status': {
          const totalProducts = await Product.countDocuments({ removed: false });
          const inStock = await Product.aggregate([
              { $match: { removed: false } },
              { $group: { _id: null, totalQty: { $sum: { $ifNull: ["$quantity", "$stockQuantity"] } } } }
          ]);
          const qty = inStock.length > 0 ? inStock[0].totalQty : 0;
          resultMessage = `📦 **Inventory Status**:\nYou have **${totalProducts} distinct products** in your catalog, with a total of **${qty} items** currently sitting in the warehouse.`;
          break;
        }

        case 'get_customer_summary': {
          const clients = await Client.countDocuments({ removed: false });
          resultMessage = `👥 **Customer Base**:\nYou currently have **${clients} registered customers** synchronized across your Ecommerce and ERP platforms.`;
          break;
        }

        case 'get_hr_summary': {
          const employees = await Employee.find({ removed: false });
          resultMessage = `👔 **HR Summary**:\nThere are **${employees.length} active employees** managing the business operations right now.`;
          break;
        }

        case 'get_expense_summary': {
          const expenses = await Expense.find({ removed: false });
          const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
          resultMessage = `📉 **Expenses Report**:\nThe total recorded business expenses amount to **$${totalExpenses.toFixed(2)}**.`;
          break;
        }

        case 'get_top_sales': {
          const topInvoices = await Invoice.aggregate([
            { $match: { removed: false } },
            { $unwind: "$items" },
            { $group: { _id: "$items.itemName", totalQty: { $sum: "$items.quantity" }, totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } } } },
            { $sort: { totalRevenue: -1 } },
            { $limit: 3 }
          ]);
          
          if (topInvoices.length > 0) {
            const list = topInvoices.map((p, i) => `${i+1}. **${p._id}** (${p.totalQty} sold, $${p.totalRevenue.toFixed(2)})`).join('\n');
            resultMessage = `🏆 **Top 3 Best Sellers**:\n${list}`;
          } else {
            resultMessage = "I couldn't find enough sales data to determine the top sellers yet.";
          }
          break;
        }

        case 'get_low_stock_alerts': {
          const lowStock = await Product.find({ 
            $or: [{ quantity: { $lte: 10 } }, { stockQuantity: { $lte: 10 } }], 
            removed: false 
          }).limit(5);

          if (lowStock.length > 0) {
            const list = lowStock.map(p => `- ${p.name || p.title} (Only ${p.quantity || p.stockQuantity} left)`).join('\n');
            resultMessage = `⚠️ **Critical Low Stock Alert**:\nThe following items are nearly depleted and need immediate restocking:\n${list}`;
          } else {
            resultMessage = "Great news! All products are currently well-stocked with no immediate shortages.";
          }
          break;
        }

        default:
          // If no hardcoded intent matched, we already have the AI's textual suggestion in resultMessage
          if (!resultMessage) {
            resultMessage = "Hmm, I didn't quite catch that. Try asking 'What is my total revenue?' or 'Show me top sales'.";
          }
      }

      return res.status(200).json({
        success: true,
        result: resultMessage,
        context_intent: intent
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
