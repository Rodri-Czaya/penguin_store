const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { authenticatePage } = require('../utils/tokenUtils');

router.get('/', authenticatePage, async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        
        const processedOrders = await Promise.all(orders.map(async (order) => {
            let processedProducts = [];
            
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

        res.render('orders', { orders: processedOrders });
    } catch (error) {
        console.error('Error loading orders:', error);
        res.status(500).send('Error loading orders');
    }
});

module.exports = router;