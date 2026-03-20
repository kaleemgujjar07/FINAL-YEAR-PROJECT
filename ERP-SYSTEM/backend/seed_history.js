const mongoose = require('mongoose');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config({ path: '.env' });

async function seedData() {
  try {
    console.log('Connecting to DB...');
    await mongoose.connect(process.env.DATABASE);
    console.log('Connected.');

    const db = mongoose.connection.db;

    // 1. Get products and users directly from collections
    const rawProducts = await db.collection('products').find({}).toArray();
    const rawUsers = await db.collection('users').find({}).toArray();

    console.log(`Initial check: ${rawProducts.length} products, ${rawUsers.length} users.`);

    if (rawProducts.length === 0) {
      console.error('No products found. Run mern-ecommercee seeder first.');
      process.exit(1);
    }

    // 2. Ensure clients exist in ERP
    let rawClients = await db.collection('clients').find({}).toArray();
    if (rawClients.length === 0) {
        console.log('No clients in ERP. Syncing from Users...');
        for (const user of rawUsers) {
            try {
                await db.collection('clients').insertOne({
                    userId: user._id,
                    name: user.name,
                    email: user.email,
                    enabled: true,
                    removed: false,
                    created: new Date(),
                    updated: new Date()
                });
            } catch (e) {}
        }
        rawClients = await db.collection('clients').find({}).toArray();
    }

    if (rawClients.length === 0) {
        console.log('No users found. Creating mock clients...');
        await db.collection('clients').insertMany([
            { name: 'John Doe', email: 'john@example.com', enabled: true, removed: false, created: new Date(), updated: new Date() },
            { name: 'Jane Smith', email: 'jane@example.com', enabled: true, removed: false, created: new Date(), updated: new Date() }
        ]);
        rawClients = await db.collection('clients').find({}).toArray();
    }

    console.log(`Proceeding with ${rawProducts.length} products and ${rawClients.length} clients.`);

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const invoices = [];
    let invoiceNumber = 40000;

    for (let i = 0; i < 400; i++) {
      const date = new Date(oneYearAgo.getTime() + Math.random() * (new Date().getTime() - oneYearAgo.getTime()));
      const client = rawClients[Math.floor(Math.random() * rawClients.length)];
      
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let subTotal = 0;

      for (let j = 0; j < numItems; j++) {
        const product = rawProducts[Math.floor(Math.random() * rawProducts.length)];
        const qty = Math.floor(Math.random() * 2) + 1;
        const itemTotal = (product.price || 0) * qty;
        
        items.push({
          itemName: product.title || product.name || 'Unknown Item',
          description: product.description || '',
          quantity: qty,
          price: product.price || 0,
          total: itemTotal
        });
        subTotal += itemTotal;
      }

      invoices.push({
        removed: false,
        number: ++invoiceNumber,
        year: date.getFullYear(),
        date: date,
        expiredDate: new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000),
        client: client._id,
        items: items,
        subTotal: subTotal,
        total: subTotal,
        currency: 'USD',
        paymentStatus: 'paid',
        status: 'sent',
        createdBy: new mongoose.Types.ObjectId('65a7e20102e12c44f59943d0'), // Mock Admin
        created: date,
        updated: date
      });
    }

    console.log(`Seeding ${invoices.length} invoices...`);
    await db.collection('invoices').insertMany(invoices);
    console.log('✅ Success: 400 Invoices Seeded');
    process.exit(0);
  } catch (err) {
    console.error('Core Seed Error:', err);
    process.exit(1);
  }
}

seedData();
