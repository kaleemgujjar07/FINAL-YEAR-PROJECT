require('dotenv').config()
const mongoose=require("mongoose")
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

exports.connectToDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log('connected to DB');
    } catch (error) {
        console.log(error);
    }
}