const mongoose=require("mongoose")
const {Schema}=mongoose
const axios = require('axios');

const userSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    }, 
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    phone: {
         type: String 
    },
    country: { 
        type: String 
    },
    address: { 
        type: String 
    },
})

// 🔗 SYNC TO ERP HOOK
userSchema.post('save', async function (doc, next) {
    try {
        await axios.post(
            'http://localhost:8888/api/clients/from-ecommerce',
            {
                userId: doc._id,
                name: doc.name,
                email: doc.email,
                phone: doc.phone,
                country: doc.country,
                address: doc.address,
            },
            {
                headers: {
                    'x-internal-key': 'supersecret123', // Use env in real apps, hardcoded from .env seen
                },
            }
        );
    } catch (err) {
        // Log but don't fail user save if sync fails
        if (err.response?.status !== 409) {
            console.error('User Sync Post-Save failed:', err.response?.data || err.message);
        }
    }
    next();
});

module.exports=mongoose.model("User",userSchema)