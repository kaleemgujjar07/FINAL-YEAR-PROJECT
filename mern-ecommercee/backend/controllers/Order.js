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
          const Product = require('../models/Product');
          
          // Enrich items with product details if they are missing
          const enrichedItems = [];
          if (Array.isArray(order.item)) {
            for (const cartItem of order.item) {
              const enriched = { ...cartItem };
              if (!enriched.title || !enriched.price) {
                const productId = cartItem.product?._id || cartItem.product;
                const prodDoc = await Product.findById(productId);
                if (prodDoc) {
                  enriched.title = enriched.title || prodDoc.title;
                  enriched.price = enriched.price || prodDoc.price;
                }
              }
              enrichedItems.push(enriched);
            }
          }

          await axios.post(
            'http://localhost:8888/api/invoices/from-ecommerce',
            {
              userId: order.user,
              orderId: order._id,
              items: enrichedItems, 
              total: order.total,
              date: order.createdAt || new Date(),
              clientInfo: {
                name: (order.address && order.address[0]?.name) || 'Ecommerce Customer',
                email: (order.address && order.address[0]?.email) || '',
                phone: (order.address && order.address[0]?.phone) || '',
                country: (order.address && order.address[0]?.country) || '',
                address: (order.address && order.address[0]?.street) || ''
              }
            },
            {
              headers: {
                'x-internal-key': process.env.ERP_INTERNAL_KEY,
              },
            }
          );
          console.log('ERP Invoice synced successfully for order:', order._id);
        } catch (err) {
          console.error('ERP Invoice sync failed for order:', order._id);
          if (err.response) {
            console.error('ERP Status:', err.response.status);
            console.error('ERP Error Data:', JSON.stringify(err.response.data, null, 2));
          } else {
            console.error('ERP Sync Error Message:', err.message);
          }
        }

        // 📧 SEND CONFIRMATION EMAIL
        try {
            const User = require('../models/User');
            const { sendMail } = require('../utils/Emails');
            const user = await User.findById(order.user);
            if (user && user.email) {
                const subject = `Order Confirmation - ${order._id}`;
                const htmlTemplate = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                        <h2 style="color: #4CAF50;">Thank you for your order, ${user.name}!</h2>
                        <p>Your order (ID: <strong>${order._id}</strong>) has been successfully placed.</p>
                        <p><strong>Total Amount:</strong> $${order.total}</p>
                        <p><strong>Payment Method:</strong> ${order.paymentMode}</p>
                        <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;">
                        <h3 style="color: #333;">Shipping Address:</h3>
                        <p style="color: #555;">
                            ${order.address[0]?.street}, ${order.address[0]?.city}, ${order.address[0]?.state} ${order.address[0]?.postalCode}<br/>
                            ${order.address[0]?.country}<br/>
                            Phone: ${order.address[0]?.phoneNumber}
                        </p>
                        <br/>
                        <p>We will notify you once your order ships.</p>
                        <p style="color: #888; font-size: 12px;">This is an automated email, please do not reply.</p>
                    </div>
                `;
                await sendMail(user.email, subject, htmlTemplate);
                console.log('Confirmation email sent to:', user.email);
            }
        } catch (emailErr) {
            console.error('Error sending confirmation email:', emailErr.message);
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
