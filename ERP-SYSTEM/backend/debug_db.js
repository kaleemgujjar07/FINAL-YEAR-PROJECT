const mongoose = require('mongoose');
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoUri = "mongodb+srv://gujjarkaleem37_db_user:kaleem217@cluster0.jzi2xz0.mongodb.net/ecommerce?retryWrites=true&w=majority";

async function checkDB() {
    try {
        console.log('Connecting...');
        await mongoose.connect(mongoUri);
        console.log('Connected.');
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        for (const coll of collections) {
            const count = await mongoose.connection.db.collection(coll.name).countDocuments();
            console.log(`- ${coll.name}: ${count} docs`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDB();
