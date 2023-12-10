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

    // Update the Product model's cartItems array
    await Product.findByIdAndUpdate(productId, {
        $push: { favorits: { _id: favorite._id } },
    });

    // Save the updated favorite
    await favorite.save();

    res.status(200).json({
        success: true,
        message: 'Product added to favorite successfully',
        data: favorite
    });
});

// removeItemFromFavorite Endpoint/API
const removeItemFromFavorite = asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid user ID: ${userId}`, 400));
    }

    // Check if the productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(createCustomError(`Invalid product ID: ${productId}`, 400));
    }

    // Fetch the user and favorite
    const user = await User.findById(userId);
    const favorite = await Favorite.findOne({ userId });

    // Check if the user and favorite exist
    if (!user || !favorite) {
        return next(createCustomError('User or favorite not found', 404));
    }

    // Check if the product exists in the favorite
    const productIndex = favorite.items.findIndex(item => item.productId && item.productId.equals(productId));

    if (productIndex === -1) {
        return next(createCustomError(`Product with ID ${productId} not found in the favorite`, 404));
    }

    // Remove the product from the favorite's items array
    favorite.items.splice(productIndex, 1);

    // Update the Product model's favorits array
    await Product.findByIdAndUpdate(productId, {
        $pull: { favorits: favorite._id },
    });

    // Save the updated favorite
    await favorite.save();

    res.status(200).json({
        success: true,
        message: 'Product removed from favorite successfully',
        data: favorite
    });
});

// clearFavorites Endpoint/API
const clearFavorites = asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid user ID: ${userId}`, 400));
    }

    // logging the process
    console.log('Clearing Favorites for userId: ' + userId);

    // Fetch the favorite
    const favorite = await Favorite.findOne({ userId });

    if (favorite) {
        // Clear all items from the favorite
        await Favorite.findByIdAndUpdate(favorite._id, {
            $set: { items: [] },
        });

        // Remove the favorite item from the Product model's favorits array for all products
        await Product.updateMany({
            favorits: favorite._id,
        }, {
            $pull: { favorits: favorite._id },
        });

        return res.status(200).json({
            success: true,
            message: 'Favorites Cleared Successfully',
            // data: {},
        });
    } else {
        return res.status(200).json({
            success: false,
            message: 'Favorites not found for the user',
        });
    }
});


module.exports = {
    fetchFavorite,
    addIItemToFavorite,
    removeItemFromFavorite,
    clearFavorites
}   