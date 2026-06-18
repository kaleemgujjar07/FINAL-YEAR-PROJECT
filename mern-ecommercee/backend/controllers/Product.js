const { Schema, default: mongoose } = require("mongoose")
const Product=require("../models/Product")
const Brand=require("../models/Brand")
const Category=require("../models/Category")

const createOrFindBrand = async (brandName) => {
    if (!brandName) return null;
    const trimmed = brandName.trim();
    let brand = await Brand.findOne({ name: trimmed });
    if (!brand) brand = await Brand.create({ name: trimmed });
    return brand._id;
};

const createOrFindCategory = async (categoryName) => {
    if (!categoryName) return null;
    const trimmed = categoryName.trim();
    let category = await Category.findOne({ name: trimmed });
    if (!category) category = await Category.create({ name: trimmed });
    return category._id;
};

const safeString = (value, fallback = '') => typeof value === 'string' && value.trim() ? value.trim() : fallback;

exports.syncFromERP = async (req, res) => {
    try {
        const payload = req.body || {};
        const title = safeString(payload.title || payload.name, 'Untitled Product');
        const description = safeString(payload.description, title);
        const price = Number(payload.price || 0);
        const stockQuantity = Number(payload.stockQuantity ?? payload.quantity ?? 0);
        const thumbnail = safeString(payload.thumbnail, 'https://via.placeholder.com/300x300?text=No+Image');
        const images = Array.isArray(payload.images) && payload.images.length ? payload.images : [thumbnail];
        const discountPercentage = Number(payload.discountPercentage ?? 0);
        const categoryName = safeString(payload.category, 'Uncategorized');
        const brandName = safeString(payload.brand, payload.brandName || 'Generic');
        const erpProductId = safeString(payload.erpProductId, payload.erpId || '');
        const isDeleted = Boolean(payload.isDeleted || payload.removed);

        const categoryId = await createOrFindCategory(categoryName);
        const brandId = await createOrFindBrand(brandName);

        const productData = {
            title,
            description,
            price,
            discountPercentage,
            stockQuantity,
            thumbnail,
            images,
            category: categoryId,
            brand: brandId,
            erpProductId,
            isDeleted,
        };

        let product = null;
        if (erpProductId) {
            product = await Product.findOne({ erpProductId });
        }
        if (!product) {
            product = await Product.findOne({ title });
        }

        if (product) {
            const updated = await Product.findByIdAndUpdate(product._id, productData, { new: true, runValidators: true });
            return res.status(200).json({ success: true, result: updated, message: 'ERP product synced to ecommerce (updated).' });
        }

        const created = new Product(productData);
        await created.save();
        return res.status(201).json({ success: true, result: created, message: 'ERP product synced to ecommerce (created).' });
    } catch (error) {
        console.log('ERP sync error:', error);
        return res.status(500).json({ message:'Error syncing ERP product to ecommerce', error: error.message });
    }
};

exports.create=async(req,res)=>{
    try {
        const created=new Product(req.body)
        await created.save()
        res.status(201).json(created)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error adding product, please trying again later'})
    }
}

exports.getAll = async (req, res) => {
    try {
        const filter={}
        const sort={}
        let skip=0
        let limit=0

        if(req.query.brand){
            filter.brand={$in:req.query.brand}
        }

        if(req.query.category){
            filter.category={$in:req.query.category}
        }

        if(req.query.user){
            filter['isDeleted']=false
        }

        if(req.query.sort){
            sort[req.query.sort]=req.query.order?req.query.order==='asc'?1:-1:1
        }

        if(req.query.page && req.query.limit){

            const pageSize=req.query.limit
            const page=req.query.page

            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Product.find(filter).sort(sort).populate("brand").countDocuments().exec()
        const results=await Product.find(filter).sort(sort).populate("brand").skip(skip).limit(limit).exec()

        res.set("X-Total-Count",totalDocs)

        res.status(200).json(results)
    
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching products, please try again later'})
    }
};

exports.getById=async(req,res)=>{
    try {
        const {id}=req.params
        const result=await Product.findById(id).populate("brand").populate("category")
        res.status(200).json(result)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error getting product details, please try again later'})
    }
}

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Product.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating product, please try again later'})
    }
}

exports.undeleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const unDeleted=await Product.findByIdAndUpdate(id,{isDeleted:false},{new:true}).populate('brand')
        res.status(200).json(unDeleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error restoring product, please try again later'})
    }
}

exports.deleteById=async(req,res)=>{
    try {
        const {id}=req.params
        const deleted=await Product.findByIdAndUpdate(id,{isDeleted:true},{new:true}).populate("brand")
        res.status(200).json(deleted)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error deleting product, please try again later'})
    }
}


