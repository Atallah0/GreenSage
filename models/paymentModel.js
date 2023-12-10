const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Payment type can not be empty'],
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference the User model
        required: true,
    },
    shippingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipping', // Reference the Shipping model
    },
});

module.exports = mongoose.model('Payment', paymentSchema);
