const Favorite = require('../models/favoriteModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// fetchFavorite Endpoint7API
const fetchFavorite = asyncWrapper(async (req, res, next) => {
    const { id: userId } = req.params;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid user ID: ${userId}`, 400));
    }

    // logging the process
    console.log(`Fetching Favorite from userId: ${userId}`);

    // Fetching the favorite based on the user
    const favorite = await Favorite.findOne({ userId });

    // If the favorite is not found return error
    if (!favorite) {
        console.log(`Error Fetching Favorite from userId: ${userId}`);
        return next(createCustomError(`Invalid User`, 403));
    }

    // The favorite is Fetched and returned in the response
    console.log(`Fetching Favorite from userId(${userId}) Successfully`);
    return res.status(200).json({
        success: true,
        message: `Favorite successfully Fetched`,
        data: favorite,
    });
});

// addIItemToFavorite Endpoint/API
const addIItemToFavorite = asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid user ID: ${userId}`, 400));
    }

    // Check if the productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(createCustomError(`Invalid user ID: ${productId}`, 400));
    }

    // Fetch the user and favorite
    const user = await User.findById(userId);
    const favorite = await Favorite.findOne({ userId });

    // Check if the user and favorite exist
    if (!user || !favorite) {
        return next(createCustomError('User or favorite not found', 404));
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
        return next(createCustomError(`Product with ID ${productId} not found`, 404));
    }

    // Check if the product is already in the favorite
    if (favorite.items.some(item => item.productId && item.productId.equals(productId))) {
        return next(createCustomError(`Product with ID ${productId} is already in the favorite`, 400));
    }


    // Add the product to the favorite's items array
    favorite.items.push({
        productId: product._id,
    });

    // Save the updated favorite
    await favorite.save();

    res.status(200).json({
        success: true,
        message: 'Product added to favorite successfully',
        data: favorite
    });
});


module.exports = {
    fetchFavorite,
    addIItemToFavorite,
}