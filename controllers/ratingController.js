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

module.exports = {
    createRating,
    getRatings
}