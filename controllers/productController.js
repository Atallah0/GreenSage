const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');
const { getCategoryNameById } = require('../services/categoryServices');


// createProduct Endpoint/API
const createProduct = asyncWrapper(async (req, res, next) => {
    const { title, description, price, availableInStock, rating, imageUrl, categoryId } = req.body;

    if (!title || !description || !price || !availableInStock || !rating || !imageUrl || !categoryId) {
        console.log('Missing required fields');
        return next(createCustomError('Please provide all required fields', 400));
    }

    // Check for existing product with the same title and description
    const existingProduct = await Product.findOne({ title, description });

    if (existingProduct) {
        return next(createCustomError('Product with the same title and description already exists', 400));
    }

    const category = await Category.findById(categoryId);

    if (!category) {
        return next(createCustomError('Category does notexist', 400));
    }

    const product = await Product.create(req.body);   // Or
    // const product = await Product.create({
    //     title,
    //     description,
    //     price,
    //     availableInStock,
    //     rating,
    //     imageUrl,
    //     categoryId
    // });

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

    const product = await Product.findById(productId);

    // Check if the productId exists
    if (!product) {
        return next(createCustomError(`No product with id: ${productId}`, 404));
    }

    // Assuming there is a reference to the "category" in your Product schema
    const categoryId = product.categoryId; // Adjust this based on your actual schema

    // Fetch the category and all its fields
    // const category = await Category.findById(categoryId);

    // Fetch the category name
    const categoryName = await getCategoryNameById(categoryId);

    res.status(200).json({
        msg: `Product fetched successfully`,
        success: true,
        data: { product, categoryName }
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
    //     title: existingProduct.title,
    //     description: existingProduct.description,
    //     price: existingProduct.price,
    //     availableInStock: existingProduct.price,
    //     rating: existingProduct.rating,
    //     imageUrl: existingProduct.imageUrl,
    //     categoryId: existingProduct.categoryId
    // }

    // // Check if the req.body is the same as existing product data
    // if (JSON.stringify(existingProductData) === JSON.stringify(req.body)) {
    //     return next(createCustomError('Nothing to update', 400))

    // }

    // console.log(JSON.stringify(existingProductData));
    // console.log(JSON.stringify(req.body));

    const updatedProduct = await Product.findByIdAndUpdate({ _id: productId }, req.body, {
        new: true,
        runValidators: true
    })

    // The approach to update the productId in Category
    // Get the categoryId of the product
    const categoryId = existingProduct.categoryId;

    if (!categoryId) {
        return next(createCustomError('Category does notexist', 400));
    }

    // Remove the product reference from the associated category
    await Category.findByIdAndUpdate(
        categoryId,
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
        return next(createCustomError('Category does notexist', 400));
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
