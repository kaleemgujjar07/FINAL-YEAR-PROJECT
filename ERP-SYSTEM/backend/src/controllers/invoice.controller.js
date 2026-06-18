const Invoice = require('../models/appModels/Invoice');
const Client = require('../models/appModels/Client');
const mongoose = require('mongoose');

exports.createInvoiceFromEcommerce = async (req, res) => {
  try {
    const fs = require('fs');
    fs.appendFileSync('backend_debug.log', `--- Ecommerce Sync Attempt ---\nTime: ${new Date().toISOString()}\nBody: ${JSON.stringify(req.body, null, 2)}\n\n`);
  } catch (e) {}

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

    // 3. Find a valid Admin for 'createdBy'
    let adminId = '65a7e20102e12c44f59943d0';
    const Admin = mongoose.model('Admin');
    const existingAdmin = await Admin.findById(adminId);
    if (!existingAdmin) {
      const anyAdmin = await Admin.findOne({ removed: false });
      if (anyAdmin) adminId = anyAdmin._id;
    }

    // 4. Create Invoice
    const invoice = await Invoice.create({
      number: nextNumber,
      year: new Date(date).getFullYear(),
      date: new Date(date),
      expiredDate: new Date(new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
      client: client._id,
      items: items.map(item => ({
        itemName: item.title || item.itemName || 'Product',
        description: item.description || '',
        quantity: item.quantity || 1,
        price: item.price || 0,
        total: (item.price || 0) * (item.quantity || 1)
      })),
      subTotal: total,
      total: total,
      currency: 'USD',
      paymentStatus: 'paid',
      status: 'sent',
      createdBy: adminId,
      notes: `Ecommerce Order ID: ${orderId}`
    });

    res.status(201).json({ success: true, result: invoice });
  } catch (err) {
    console.error('Invoice Sync Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
