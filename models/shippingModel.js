const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered'],
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
});

module.exports = mongoose.model('Shipping', shippingSchema);
