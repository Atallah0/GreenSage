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

module.exports = {
    createCategory,
}