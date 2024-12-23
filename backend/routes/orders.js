const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Order = require('../models/order');
const Product = require('../models/product');

router.get('/', async (req, res) => {
    try {
        const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.redirect('/auth/login');
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token verified:', decoded);

            // Fetch orders
            console.log('Fetching orders...');
            const orders = await Order.find().sort({ orderDate: -1 });
            console.log('Orders found:', orders);

            // Process orders safely
            const processedOrders = await Promise.all(orders.map(async (order) => {
                let processedProducts = [];
                
                // Safely process products if they exist
                if (order.products && Array.isArray(order.products)) {
                    processedProducts = await Promise.all(order.products.map(async (product) => {
                        try {
                            const productInfo = await Product.findById(product.productId);
                            return {
                                productName: productInfo ? productInfo.name : 'Product not found',
                                quantity: product.quantity || 0
                            };
                        } catch (error) {
                            return {
                                productName: 'Error loading product',
                                quantity: 0
                            };
                        }
                    }));
                }

                return {
                    customerName: order.customerName || 'No name provided',
                    address: order.address || 'No address provided',
                    totalAmount: order.totalAmount || 0,
                    status: order.status || 'completed',
                    orderDate: order.orderDate || new Date(),
                    products: processedProducts
                };
            }));

            // Render orders page with processed data
            res.render('orders', { 
                orders: processedOrders,
                token: token
            });

        } catch (error) {
            console.error('Token verification or data processing failed:', error);
            res.redirect('/auth/login');
        }
    } catch (error) {
        console.error('Error in orders route:', error);
        res.status(500).send('Error loading orders');
    }
});

module.exports = router;