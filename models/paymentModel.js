const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    type: {
        type: String,
        required: [true, 'Payment type can not be empty'],
        enum: ['credit', 'debit'],
        trim: true,
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
});

module.exports = mongoose.model('Payment', paymentSchema);
