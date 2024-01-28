const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference the User model
        required: true,
    },
    date: {
        type: Date,
        require: true,
    },
    deliveryFee: {
        type: Number,
        required: true
    },
    paymentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment',  // Reference the User model
        required: false,
    },
    shipmentStatus: {
        type: String,
        enum: ['pending', 'shipped', 'delivered'],
        default: 'pending',
    },
    userAddress: {},
    userName: {},
    totalPrice: Number,
    cartItems: [],
});

module.exports = mongoose.model('Order', orderSchema);

