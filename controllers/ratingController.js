const Rating = require('../models/ratingModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// createRating Endpoin/API
const createRating = asyncWrapper(async (req, res, next) => {
    const { title, rating, description, userId, productId } = req.body;

    if (!title || !rating || !description || !userId || !productId) {
        console.log('Missing required fields');
        return next(createCustomError('Please provide all required fields', 400));
    };

    // Check for existing rating with the same userId and productId
    const existingRating = await Rating.findOne({ userId, productId });

    if (existingRating) {
        return next(createCustomError('Rating with the same userId and productId already exists', 400));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(createCustomError('User does notexist', 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
        return next(createCustomError('Product does notexist', 400));
    }

    const rate = await Rating.create(req.body);

    // Update the associated user with the new rating reference
    await user.updateOne(
        { $push: { ratings: rate._id } },
        { new: true }
    );

    // Update the associated product with the new rating reference
    await product.updateOne(
        { $push: { ratings: rate._id } },
        { new: true }
    );

    console.log('Rating created successfully');
    res.status(201).json({
        msg: `Rating created successfully`,
        success: true,
        data: rate,
    });
});

// getRatings Endpoint/API
const getRatings = asyncWrapper(async (req, res, next) => {
    const ratings = await Rating.find({});

    res.status(200).json({
        msg: `Ratings fetched successfully`,
        success: true,
        data: ratings
    })
});

// getRating Endpoint/API
const getRating = asyncWrapper(async (req, res, next) => {
    const { id: ratingId } = req.params;

    // Check if the ratingId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
        return next(createCustomError(`Invalid rating ID: ${ratingId}`, 400));
    }

    const rating = await Rating.findById(ratingId);

    // Check if the ratingId exists
    if (!rating) {
        return next(createCustomError(`No rating with id: ${ratingId}`, 404));
    }

    res.status(200).json({
        msg: `Rating fetched successfully`,
        success: true,
        data: rating
    })
});

// updateRating Endpoint/API    
const updateRating = asyncWrapper(async (req, res, next) => {
    const { id: ratingId } = req.params;

    // Check if the ratingId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
        return next(createCustomError(`Invalid rating ID: ${ratingId}`, 400));
    }

    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
        return next(createCustomError(`No rating with id: ${ratingId}`, 404));
    }

    const updatedRating = await Rating.findByIdAndUpdate({ _id: ratingId }, req.body, {
        new: true,
        runValidators: true
    })

    const userId = await User.findById(req.body.userId);
    if (!userId) {
        return next(createCustomError('User does not exist', 400));
    }

    const productId = await Product.findById(req.body.productId);
    if (!productId) {
        return next(createCustomError('Product does not exist', 400));
    }

    const existingUserId = existingRating.userId;
    const existingProductId = existingRating.productId;

    // Remove the rating reference from the associated user
    await User.findByIdAndUpdate(
        existingUserId,
        { $pull: { ratings: ratingId } },
        { new: true }
    );

    // Add the rating reference to the associated user
    await User.updateOne(
        { _id: req.body.userId },
        { $push: { ratings: ratingId } },
        { new: true }
    );

    // Remove the rating reference from the associated product
    await Product.findByIdAndUpdate(
        existingProductId,
        { $pull: { ratings: ratingId } },
        { new: true }
    );

    // Add the product reference to the associated rating
    await Product.updateOne(
        { _id: req.body.productId },
        { $push: { ratings: ratingId } },
        { new: true }
    );

    res.status(200).json({
        msg: `Rating updated successfully`,
        success: true,
        data: updatedRating
    })
});

// deleteRating Endpoint/API    
const deleteRating = asyncWrapper(async (req, res, next) => {
    const { id: ratingId } = req.params;

    // Check if the ratingId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(ratingId)) {
        return next(createCustomError(`Invalid rating ID: ${ratingId}`, 400));
    }

    const existingRating = await Rating.findById(ratingId);
    if (!existingRating) {
        return next(createCustomError(`No rating with id: ${ratingId}`, 404));
    }

    const userId = await User.findById(req.body.userId);
    if (!userId) {
        return next(createCustomError('User does not exist', 400));
    }

    const productId = await Product.findById(req.body.productId)
    if (!productId) {
        return next(createCustomError('Product does not exist', 400));
    }

    // Remove the rating reference from the associated user
    await User.findByIdAndUpdate(
        userId,
        { $pull: { ratings: userId } },
        { new: true }
    );

    // Remove the product reference from the associated rating
    await Product.findByIdAndUpdate(
        productId,
        { $pull: { ratings: ratingId } },
        { new: true }
    );

    // Delete the rating
    await existingRating.deleteOne();

    res.status(200).json({
        msg: `Rating deleted successfully`,
        success: true,
    });
});

module.exports = {
    createRating,
    getRatings,
    getRating,
    updateRating,
    deleteRating
}