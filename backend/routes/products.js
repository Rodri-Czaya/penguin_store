const express = require('express');
const router = express.Router();
const Product = require('../models/product');
const jwt = require('jsonwebtoken');

// List products
router.get('/', async (req, res) => {
    try {
        const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.redirect('/auth/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const products = await Product.find({});
            res.render('products', { 
                products: products || [],
                admin: decoded,
                token: token
            });
        } catch (error) {
            console.error('Token verification failed:', error);
            res.redirect('/auth/login');
        }
    } catch (error) {
        console.error('Error in products route:', error);
        res.status(500).send('Error loading products page');
    }
});

// Add product form
router.get('/add', async (req, res) => {
    try {
        const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.redirect('/auth/login');
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.render('products-add', { token: token });
        } catch (error) {
            res.redirect('/auth/login');
        }
    } catch (error) {
        res.status(500).send('Error loading form');
    }
});

// Edit product form
router.get('/edit/:id', async (req, res) => {
    try {
        const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.redirect('/auth/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const product = await Product.findById(req.params.id);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            res.render('products-edit', { product, token: token });
        } catch (error) {
            res.redirect('/auth/login');
        }
    } catch (error) {
        res.status(500).send('Error loading form');
    }
});

// Create product
router.post('/', async (req, res) => {
    try {
        const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET);
            const product = new Product(req.body);
            await product.save();
            res.status(201).json({ message: 'Product created successfully' });
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating product' });
    }
});

// Update product
router.put('/:id', async (req, res) => {
    try {
        const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET);
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
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating product' });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const token = req.query.token || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            jwt.verify(token, process.env.JWT_SECRET);
            const product = await Product.findByIdAndDelete(req.params.id);
            if (!product) {
                return res.status(404).json({ message: 'Product not found' });
            }
            res.json({ message: 'Product deleted successfully' });
        } catch (error) {
            res.status(401).json({ message: 'Invalid token' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product' });
    }
});

module.exports = router;