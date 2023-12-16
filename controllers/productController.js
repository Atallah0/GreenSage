const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');
const { getCategoryNameById } = require('../services/categoryServices');


// createProduct Endpoint/API
const createProduct = asyncWrapper(async (req, res, next) => {
    const { name, description, price, availableInStock, imageUrl, categoryId } = req.body;

    if (!name || !description || !price || !availableInStock || !imageUrl || !categoryId) {
        console.log('Missing required fields');
        return next(createCustomError('Please provide all required fields', 400));
    }

    // Check for existing product with the same name and description
    const existingProduct = await Product.findOne({ name, description });

    if (existingProduct) {
        return next(createCustomError('Product with the same name and description already exists', 400));
    }

    const category = await Category.findById(categoryId);

    if (!category) {
        return next(createCustomError('Category does notexist', 400));
    }

    // Fetch user details
    const createdBy = req.user.id;
    const user = await User.findOne({ _id: createdBy });
    console.log(user);
    // Access user's firstName
    const firstName = user.firstName;
    const lastName = user.lastName;
    console.log(firstName + lastName);

    const owner = `${firstName} ${lastName}`;

    // const product = await Product.create(req.body, owner);   // Or
    const product = await Product.create({
        name,
        description,
        price,
        availableInStock,
        imageUrl,
        categoryId,
        owner
    });

    // Update the associated category with the new product reference
    await category.updateOne(
        { $push: { products: product._id } },
        { new: true }
    );

    console.log('Product created successfully');
    res.status(201).json({
        msg: `Product created successfully`,
        success: true,
        data: product,
    });
});

// getProducts Endpoint/API
const getProducts = asyncWrapper(async (req, res, next) => {
    const products = await Product.find({});

    res.status(200).json({
        msg: `Products fetched successfully`,
        success: true,
        data: products
    })
});

// getProduct Endpoint/API
const getProduct = asyncWrapper(async (req, res, next) => {
    const { id: productId } = req.params;

    // Check if the productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(createCustomError(`Invalid productId ID: ${productId}`, 400));
    }
    // -----------------------------------------------------------------------------------------------------
    // Fetch the product and populate its 'ratings' field
    const product = await Product.findById(productId).populate('ratings', '-ratingId -__v');

    // Check if the productId exists
    if (!product) {
        return next(createCustomError(`No product with id: ${productId}`, 404));
    }

    // Calculate the average rating
    const averageRating = product.averageRating;

    const categoryId = product.categoryId;

    // Fetch the category and all its fields
    // const category = await Category.findById(categoryId);

    // Fetch the category name
    const categoryName = await getCategoryNameById(categoryId);

    res.status(200).json({
        msg: `Product fetched successfully`,
        success: true,
        data: { product, averageRating, categoryName }
    })
});


// updateProduct Endpoint/API
const updateProduct = asyncWrapper(async (req, res, next) => {
    const { id: productId } = req.params;

    // Check if the productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(createCustomError(`Invalid productId ID: ${productId}`, 400));
    }

    const existingProduct = await Product.findById(productId);

    // Check if the productId exists
    if (!existingProduct) {
        return next(createCustomError(`No product with id: ${productId}`, 404));
    }

    // const existingProductData = {
    //     name: existingProduct.name,
    //     description: existingProduct.description,
    //     price: existingProduct.price,
    //     availableInStock: existingProduct.price,
    //     imageUrl: existingProduct.imageUrl,
    //     categoryId: existingProduct.categoryId
    // }

    // // Check if the req.body is the same as existing product data
    // if (JSON.stringify(existingProductData) === JSON.stringify(req.body)) {
    //     return next(createCustomError('Nothing to update', 400))

    // }

    // console.log(JSON.stringify(existingProductData));
    // console.log(JSON.stringify(req.body));



    // The approach to update the productId in Category
    // Get the categoryId of the product

    const updatedProduct = await Product.findByIdAndUpdate({ _id: productId }, req.body, {
        new: true,
        runValidators: true
    })

    const categoryId = await Category.findById(req.body.categoryId)

    if (!categoryId) {
        return next(createCustomError('Category does not exist', 400));
    }

    const existingCategoryId = existingProduct.categoryId;

    // Remove the product reference from the associated category
    await Category.findByIdAndUpdate(
        existingCategoryId,
        { $pull: { products: productId } },
        { new: true }
    );

    // Update the associated category with the new product reference
    await Category.updateOne(
        { _id: req.body.categoryId },
        { $push: { products: productId } },
        { new: true }
    );

    res.status(200).json({
        msg: `Product updated successfully`,
        success: true,
        data: updatedProduct
    })
});


// deleteProduct Endpoint/API
const deleteProduct = asyncWrapper(async (req, res, next) => {
    const { id: productId } = req.params;

    // Check if the productId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return next(createCustomError(`Invalid productId ID: ${productId}`, 400));
    }

    const existingProduct = await Product.findById(productId);

    // Check if the productId exists
    if (!existingProduct) {
        return next(createCustomError(`No product with id: ${productId}`, 404));
    }

    // Get the categoryId of the product
    const categoryId = existingProduct.categoryId;

    if (!categoryId) {
        return next(createCustomError('Category does not exist', 400));
    }

    // Remove the product reference from the associated category
    await Category.findByIdAndUpdate(
        categoryId,
        { $pull: { products: productId } },
        { new: true }
    );

    // Delete the product
    await existingProduct.deleteOne();

    res.status(200).json({
        msg: `Product deleted successfully`,
        success: true,
    });
});


module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
}
