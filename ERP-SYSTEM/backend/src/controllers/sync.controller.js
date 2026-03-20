const mongoose = require('mongoose');
const Product = mongoose.model('Product');
const Client = mongoose.model('Client');
const Invoice = mongoose.model('Invoice');
const Admin = mongoose.model('Admin');
const Setting = mongoose.model('Setting');

// Helper to handle invoice numbering similar to ERP internal logic
const getNextInvoiceNumber = async () => {
  const setting = await Setting.findOne({ settingKey: 'last_invoice_number' });
  if (setting) {
    const nextNumber = parseInt(setting.settingValue) + 1;
    await Setting.findOneAndUpdate(
      { settingKey: 'last_invoice_number' },
      { settingValue: nextNumber.toString() }
    );
    return nextNumber;
  }
  return 1;
};

exports.syncOrder = async (req, res) => {
  try {
    console.log('📩 ERP RECEIVED SYNC REQUEST:', JSON.stringify(req.body, null, 2));
    const { userId, items, total, address, paymentMode } = req.body;

    console.log('🔄 ERP SYNC: Processing order for user', userId);

    // 1. Deduct Stock from ERP Products
    if (items && Array.isArray(items)) {
        for (const rawItem of items) {
          // Handle both flat and nested structure { product: { title } }
          const itemTitle = rawItem.title || rawItem.itemName || (rawItem.product && rawItem.product.title) || (rawItem.product && rawItem.product.name);
          const itemQuantity = rawItem.quantity || 1;

          if (itemTitle) {
              const product = await Product.findOne({
                $or: [{ name: itemTitle }, { name: new RegExp('^' + itemTitle + '$', 'i') }]
              });
              if (product) {
                console.log(`📉 Deducting ${itemQuantity} from ${product.name}`);
                product.quantity = Math.max(0, product.quantity - itemQuantity);
                await product.save();
              } else {
                console.log(`⚠️ Product not found in ERP for sync: ${itemTitle}`);
              }
          }
        }
    }

    // 2. Ensure Client exists in ERP
    let client = await Client.findOne({ userId: userId });
    if (!client) {
      console.log('👤 Creating new ERP Client for sync');
      client = await Client.create({
        userId,
        name: (address && address.name) || (address && address.firstName ? `${address.firstName} ${address.lastName}` : 'E-commerce Customer'),
        email: (address && address.email) || '',
        phone: (address && (address.phone || address.phoneNumber)) || '',
        address: (address && (address.address || address.street)) || '',
        enabled: true,
      });
    }

    // 3. Create ERP Invoice
    // Fallback: find any enabled admin, or just any admin if none explicitly enabled
    let systemAdmin = await Admin.findOne({ enabled: true, removed: false });
    if (!systemAdmin) {
        systemAdmin = await Admin.findOne({ removed: false });
    }
    
    if (!systemAdmin) {
        console.error('❌ Sync failed: No admin account found in database.');
        return res.status(500).json({ success: false, message: 'No admin found to create invoice' });
    }

    const date = new Date();
    const expiredDate = new Date();
    expiredDate.setDate(date.getDate() + 7);

    const nextNumber = await getNextInvoiceNumber();

    const invoiceItems = items.map(rawItem => {
        const title = rawItem.title || rawItem.itemName || (rawItem.product && rawItem.product.title) || 'Product';
        const price = rawItem.price || (rawItem.product && rawItem.product.price) || 0;
        const qty = rawItem.quantity || 1;
        return {
            itemName: title,
            description: rawItem.description || (rawItem.product && rawItem.product.description) || '',
            quantity: qty,
            price: price,
            total: qty * price
          };
    });

    const invoiceData = {
      number: nextNumber,
      year: date.getFullYear(),
      date,
      expiredDate,
      client: client._id,
      items: invoiceItems,
      subTotal: total,
      taxTotal: 0,
      taxRate: 0,
      total: total,
      currency: 'PKR',
      paymentStatus: 'unpaid',
      createdBy: systemAdmin._id,
      status: 'pending',
    };

    const invoice = await new Invoice(invoiceData).save();
    
    // Update PDF reference (ERP pattern)
    invoice.pdf = 'invoice-' + invoice._id + '.pdf';
    await invoice.save();

    console.log('✅ ERP SYNC: Invoice created successfully #', nextNumber);

    res.status(201).json({
      success: true,
      result: invoice,
      message: 'Order synced to ERP successfully',
    });
  } catch (err) {
    console.error('❌ ERP SYNC ERROR:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
