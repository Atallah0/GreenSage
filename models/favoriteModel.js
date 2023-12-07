const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // Reference the User model
        required: true,
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',  // Reference the Product model
            }
        }
    ]
});

module.exports = mongoose.model('Favorite', favoriteSchema);
