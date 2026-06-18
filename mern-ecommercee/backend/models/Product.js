const mongoose=require("mongoose")
const {Schema}=mongoose

const productSchema= new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    discountPercentage: {
        type: Number,
        default: 0,
    },
    category:{
        type:Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },
    brand:{
        type:Schema.Types.ObjectId,
        ref:"Brand",
        required:true
    },
    stockQuantity:{
        type:Number,
        required:true
    },
    thumbnail:{
        type:String,
        required:true
    },
    images:{
        type:[String],
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    erpProductId: {
        type: String,
        index: true,
        sparse: true
    },
    // 🔗 ERP COMPATIBILITY FIELDS
    name: { type: String },
    quantity: { type: Number },
    removed: { type: Boolean, default: false }
},{timestamps:true,versionKey:false})

// 🔁 SYNC HOOKS FOR ERP
productSchema.pre('save', function (next) {
    if (this.title) this.name = this.title;
    if (this.stockQuantity !== undefined) this.quantity = this.stockQuantity;
    if (this.isDeleted !== undefined) this.removed = this.isDeleted;
    next();
});

module.exports=mongoose.model('Product',productSchema)