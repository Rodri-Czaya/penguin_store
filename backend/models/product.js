// models/product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: String,
    imageUrl: String
}, {
    timestamps: true
});

// Make sure we're exporting the model correctly
module.exports = mongoose.model('Product', productSchema);