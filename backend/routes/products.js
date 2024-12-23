const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const { authenticatePage, authenticateApi } = require('../utils/tokenUtils');

// Page routes
router.get('/', authenticatePage, async (req, res) => {
    try {
        const products = await Product.find({});
        res.render('products', { 
            products: products || []
        });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).send('Error loading products');
    }
});

router.get('/add', authenticatePage, async (req, res) => {
    try {
        res.render('products-add');
    } catch (error) {
        res.status(500).send('Error loading form');
    }
});

router.get('/edit/:id', authenticatePage, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('products-edit', { product });
    } catch (error) {
        res.status(500).send('Error loading product');
    }
});

// API routes
router.post('/', authenticateApi, async (req, res) => {
    try {
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({ message: 'Product created successfully' });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Error creating product' });
    }
});

router.put('/:id', authenticateApi, async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product' });
    }
});

router.delete('/:id', authenticateApi, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;