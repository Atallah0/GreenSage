const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered'],
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Orders'
    }]
});

module.exports = mongoose.model('Shipping', shippingSchema);
