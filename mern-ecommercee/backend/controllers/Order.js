const Order = require("../models/Order");

exports.create=async(req,res)=>{
    try {
        const created=new Order(req.body)
        const order = await created.save()

        // 📉 DEDUCT STOCK LEVELS
        try {
            const Product = require('../models/Product');
            if (Array.isArray(order.item)) {
                for (const cartItem of order.item) {
                    const qty = cartItem.quantity || 1;
                    const productId = cartItem.product?._id || cartItem.product;
                    if (productId) {
                        await Product.findByIdAndUpdate(productId, { 
                            $inc: { stockQuantity: -qty, quantity: -qty } 
                        });
                    }
                }
            }
        } catch(e) {
            console.error('Stock decrement error:', e.message);
        }

        // 🔁 SYNC TO ERP (Create Invoice)
        try {
          const axios = require('axios');
          await axios.post(
            'http://localhost:8888/api/invoices/from-ecommerce',
            {
              userId: order.user,
              orderId: order._id,
              items: order.item, // Wait, I should check the Order model field name
              total: order.totalAmount,
              date: order.createdAt,
              clientInfo: {
                name: order.selectedAddress.name,
                email: order.selectedAddress.email,
                phone: order.selectedAddress.phone,
                country: order.selectedAddress.country,
                address: order.selectedAddress.street
              }
            },
            {
              headers: {
                'x-internal-key': process.env.ERP_INTERNAL_KEY,
              },
            }
          );
        } catch (err) {
          console.error('ERP Invoice sync failed:', err.response?.data || err.message);
        }

        res.status(201).json(order)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error creating an order, please trying again later'})
    }
}

exports.getByUserId=async(req,res)=>{
    try {
        const {id}=req.params
        const results=await Order.find({user:id})
        res.status(200).json(results)
    } catch (error) {
        console.log(error);
        return res.status(500).json({message:'Error fetching orders, please trying again later'})
    }
}

exports.getAll = async (req, res) => {
    try {
        let skip=0
        let limit=0

        if(req.query.page && req.query.limit){
            const pageSize=req.query.limit
            const page=req.query.page
            skip=pageSize*(page-1)
            limit=pageSize
        }

        const totalDocs=await Order.find({}).countDocuments().exec()
        const results=await Order.find({}).skip(skip).limit(limit).exec()

        res.header("X-Total-Count",totalDocs)
        res.status(200).json(results)

    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error fetching orders, please try again later'})
    }
};

exports.updateById=async(req,res)=>{
    try {
        const {id}=req.params
        const updated=await Order.findByIdAndUpdate(id,req.body,{new:true})
        res.status(200).json(updated)
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Error updating order, please try again later'})
    }
}
