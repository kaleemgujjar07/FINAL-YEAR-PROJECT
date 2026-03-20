const mongoose = require('mongoose');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoUri = "mongodb+srv://gujjarkaleem37_db_user:kaleem217@cluster0.jzi2xz0.mongodb.net/ecommerce?retryWrites=true&w=majority";

async function repairData() {
    try {
        console.log('Connecting...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');
        
        const db = mongoose.connection.db;
        
        // Repair Products
        console.log('Repairing Products...');
        const productRes = await db.collection('products').updateMany(
            { removed: { $exists: false } },
            { $set: { removed: false, enabled: true, created: new Date() } }
        );
        console.log(`- Updated ${productRes.modifiedCount} products.`);

        // Repair Categories
        console.log('Repairing Categories...');
        const catRes = await db.collection('categories').updateMany(
            { removed: { $exists: false } },
            { $set: { removed: false, enabled: true, created: new Date() } }
        );
        console.log(`- Updated ${catRes.modifiedCount} categories.`);

        // Repair Brands
        console.log('Repairing Brands...');
        const brandRes = await db.collection('brands').updateMany(
            { removed: { $exists: false } },
            { $set: { removed: false, enabled: true, created: new Date() } }
        );
        console.log(`- Updated ${brandRes.modifiedCount} brands.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

repairData();
