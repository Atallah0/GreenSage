const Category = require('../models/categoryModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// createCategory Endpoint/API
const createCategory = asyncWrapper(async (req, res, next) => {
    const { name, description } = req.body;

    if (!name || !description) {
        return next(createCustomError('Please provide all required fields', 400));
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
        msg: `Category created successfully`,
        success: true,
        data: category
    })
});

// getCategories Endpoint/API
const getCategories = asyncWrapper(async (req, res, next) => {
    const categories = await Category.find({});

    res.status(200).json({
        msg: `Categories fetched successfully`,
        success: true,
        data: categories
    })
});

// // getCategory Endpoint/API
// const getCategory = asyncWrapper(async (req, res, next) => {
//     const { id: categoryId } = req.params;

//     // Check if the categoryId is a valid ObjectId
//     if (!mongoose.Types.ObjectId.isValid(categoryId)) {
//         return next(createCustomError(`Invalid category ID: ${categoryId}`, 400));
//     }

//     // const category = await Category.findOne({ _id: categoryId })
//     const category = await Category.findById(categoryId);

//     // Check if the category exists
//     if (!category) {
//         return next(createCustomError(`No category with id: ${categoryId}`, 404));
//     }

//     res.status(200).json({
//         msg: 'Category fetched successfully',
//         success: true,
//         data: category
//     })
// });

const getCategory = asyncWrapper(async (req, res, next) => {
    const { id: categoryId } = req.params;

    // Check if the categoryId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return next(createCustomError(`Invalid category ID: ${categoryId}`, 400));
    }

    // -----------------------------------------------------------------------
    // Fetch the category and populate its 'products' field
    const category = await Category.findById(categoryId).populate('products', '-categoryId -__v');

    // Check if the category exists
    if (!category) {
        return next(createCustomError(`No category with id: ${categoryId}`, 404));
    }

    res.status(200).json({
        msg: 'Category fetched successfully',
        success: true,
        data: category
    });
});



module.exports = {
    createCategory,
    getCategories,
    getCategory,
}