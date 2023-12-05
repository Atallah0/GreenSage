const mongoose = require('mongoose');
const { Decimal128 } = require('mongodb');

const cartSchema = new mongoose.Schema({
    totalPrice: {
        type: Decimal128,
        required: [true, `Total price can not be empty`],
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference the User model
        required: true,
    },
    cartItems: [
        {
            price: {
                type: Decimal128,
                required: [true, `Price can not be empty`],
            },
            quantity: {
                type: Number,
                required: [true, `Quantity can not be empty`],
                minLength: [0, 'Quantity can not be less than 0'],
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',  // Reference the Product model
                required: true,
            }
        },
    ]
});

module.exports = mongoose.model('Cart', cartSchema);