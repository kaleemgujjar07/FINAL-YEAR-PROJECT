const mongoose = require('mongoose');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoUri = "mongodb+srv://gujjarkaleem37_db_user:kaleem217@cluster0.jzi2xz0.mongodb.net/ecommerce?retryWrites=true&w=majority";

async function syncFields() {
    try {
        console.log('Connecting...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');
        
        const db = mongoose.connection.db;
        
        console.log('Syncing Product fields...');
        const products = await db.collection('products').find({}).toArray();
        let nameUpdates = 0;
        let qtyUpdates = 0;

        for (const p of products) {
            let update = {};
            if (!p.name && p.title) {
                update.name = p.title;
                nameUpdates++;
            }
            if (p.quantity === undefined && p.stockQuantity !== undefined) {
                update.quantity = p.stockQuantity;
                qtyUpdates++;
            }
            if (Object.keys(update).length > 0) {
                await db.collection('products').updateOne(
                    { _id: p._id },
                    { $set: update }
                );
            }
        }
        console.log(`- Updated ${nameUpdates} product names.`);
        console.log(`- Updated ${qtyUpdates} product quantities.`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

syncFields();
