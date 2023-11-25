const { Decimal128 } = require('mongodb');
const mongoose = require('mongoose');

const imageURLRegex = /^(http|https):\/\/(www\.)?(.*)\.(?:jpeg|jpg|png|gif)$/i;

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, `Title can not be empty`],
        trim: true,
        minLength: [1, 'Title can not be less than 1 character'],
        maxLength: [50, 'Title can not be longer than 50 characters']
    },
    description: {
        type: String,
        required: [true, `Description can not be empty`],
        trim: true,
        minLength: [1, 'Description can not be less than 1 character'],
        maxLength: [255, 'Description can not be longer than 50 characters']
    },
    price: {
        type: Decimal128,
        default: 0,
    },
    availableInStock: {
        type: Number,
        default: 0
    },
    rating: {
        type: Decimal128,
    },
    // ratingCount: Number, // Number of reviews
    imageUrl: {
        type: String,
        required: [true, `ImageUrl can not be empty`],
        trim: true,
        validate: [
            {
                validator: (value) => imageURLRegex.test(value),
                message: `Invalid image URL format`,
            },
        ],
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',  // Reference the Category model
        required: true,
    },
});

module.exports = mongoose.model('Product', productSchema);