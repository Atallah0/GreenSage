const mongoose = require('mongoose');
const { Decimal128 } = require('mongodb');

const imageURLRegex = /^(http|https):\/\/(www\.)?(.*)\.(?:jpeg|jpg|png|gif)$/i;

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, `Name can not be empty`],
        trim: true,
        minLength: [1, 'Name can not be less than 1 character'],
        maxLength: [50, 'Name can not be longer than 50 characters']
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
        required: [true, `Price can not be empty`],
        default: 0,
    },
    availableInStock: {
        type: Number,
        default: 0
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
    ratings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Rating', // Reference the Rating model
    }],
    cartItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CartItem', // Reference the CartItem model
    }],
    favorits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Favorite', // Reference the Favorite model
    }],
    owner: {
        type: String    
    }
});

// Virtual field for calculated average rating
productSchema.virtual('averageRating').get(function () {
    // Calculate the average rating from the 'ratings' array
    const ratings = this.ratings;
    if (ratings.length === 0) {
        return 0;
    }

    const sum = ratings.reduce((acc, rating) => acc + Number(rating.rating), 0);
    const average = sum / ratings.length;
    return average;
});

module.exports = mongoose.model('Product', productSchema);