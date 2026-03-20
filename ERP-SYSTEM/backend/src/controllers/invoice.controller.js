const Invoice = require('../models/appModels/Invoice');
const Client = require('../models/appModels/Client');
const mongoose = require('mongoose');

exports.createInvoiceFromEcommerce = async (req, res) => {
  try {
    const { userId, orderId, items, total, date, clientInfo } = req.body;

    // 1. Find or Create Client in ERP
    let client = await Client.findOne({ userId });
    if (!client) {
      client = await Client.create({
        userId,
        name: clientInfo.name,
        email: clientInfo.email,
        phone: clientInfo.phone,
        country: clientInfo.country,
        address: clientInfo.address,
        enabled: true,
      });
    }

    // 2. Generate Invoice Number (Simple sequential for now or use timestamp)
    const lastInvoice = await Invoice.findOne().sort({ number: -1 });
    const nextNumber = lastInvoice ? lastInvoice.number + 1 : 1001;

    // 3. Create Invoice
    const invoice = await Invoice.create({
      number: nextNumber,
      year: new Date(date).getFullYear(),
      date: new Date(date),
      expiredDate: new Date(new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      client: client._id,
      items: items.map(item => ({
        itemName: item.title,
        description: item.description || '',
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity
      })),
      subTotal: total,
      total: total,
      currency: 'USD',
      paymentStatus: 'paid',
      status: 'sent',
      createdBy: '65a7e20102e12c44f59943d0', // Fallback System Admin ID (needs verification)
      notes: `Ecommerce Order ID: ${orderId}`
    });

    res.status(201).json({ success: true, result: invoice });
  } catch (err) {
    console.error('Invoice Sync Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
