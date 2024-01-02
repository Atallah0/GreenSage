const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const User = require('../models/userModel');
const Rating = require('../models/ratingModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');
const { getCategoryNameById } = require('../services/categoryServices');
const { PAGE_SIZE } = require('../constants');


// createProduct Endpoint/API
const createProduct = asyncWrapper(async (req, res, next) => {
    const { name, description, price, availableInStock, imageUrl, categoryId, newAdded, featured, popular, topSelling } = req.body;

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
        owner,
        newAdded,
        featured,
        popular,
        topSelling
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
    const { pageNumber } = req.query;

    if (!pageNumber) {
        return next(createCustomError('Page Number is missing', 400));
    }

    if (isNaN(pageNumber) || pageNumber < 1) {
        return next(createCustomError('Invalid Page Number', 400));
    }

    const newPageOffset = pageNumber === 1 ? 0 : (pageNumber - 1) * PAGE_SIZE;

    // Populate the 'ratings' field for each product
    const products = await Product.find({})
        .skip(newPageOffset)
        .limit(PAGE_SIZE)
        .populate({
            path: 'ratings',
            select: '-ratingId -__v'
        })

    const totalProducts = await Product.find({}).count();
    const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

    if (pageNumber > totalPages) {
        return next(createCustomError('Page Number exceeds total pages', 400));
    }

    // Access the virtual field 'averageRating' for each product
    const productsWithDetails = await Promise.all(products.map(async (product) => {
        const categoryId = product.categoryId;
        const categoryName = await getCategoryNameById(categoryId);

        const averageRating = product.averageRating

        // Fetch user details for each rating
        const userIds = product.ratings.map(rating => rating.userId);
        const ratingUsers = await Promise.all(userIds.map(userId => User.findById(userId)));

        // Extract relevant information from each user
        const ratingDetails = product.ratings.map((rating, index) => ({
            rating: {
                _id: rating._id,
                userName: ratingUsers[index] ? `${ratingUsers[index].firstName} ${ratingUsers[index].lastName}` : "Unknown",
                title: rating.title,
                rating: rating.rating,
                description: rating.description,
            },
        }));

        return {
            _id: product._id,
            owner: product.owner,
            categoryName,
            name: product.name,
            description: product.description,
            price: product.price,
            availableInStock: product.availableInStock,
            imageUrl: product.imageUrl,
            cartItems: product.cartItems,
            favorits: product.favorits,
            averageRating,
            ratingCount: product.ratings.length,
            ratingDetails,
            newAdded: product.newAdded,
            featured: product.featured,
            popular: product.popular,
            topSelling: product.topSelling
        };

    }));

    res.status(200).json({
        msg: `Products fetched successfully`,
        success: true,
        data: { products: productsWithDetails, totalProducts, totalPages }
    });
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
    // const averageRating = product.averageRating;

    const categoryId = product.categoryId;

    // Fetch the category and all its fields
    // const category = await Category.findById(categoryId);

    // Fetch the category name
    const categoryName = await getCategoryNameById(categoryId);

    // Return the count of ratings
    const ratingCount = product.ratings.length;

    const ownerName = product.owner
    // Split the full name into an array of first and last names
    const nameParts = ownerName.split(' ');
    // Extract firstName and lastName
    const firstName = nameParts[0]; // "John"
    const lastName = nameParts.slice(1).join(' '); // "Doe"

    const ownerDetails = await User.find({
        firstName: firstName,
        lastName: lastName
    }, {
        healthStatus: 0, ratings: 0, orders: 0
    });

    // console.log(ownerDetails);

    // Fetch user details for each rating
    const userIds = product.ratings.map(rating => rating.userId);
    const ratingUsers = await Promise.all(userIds.map(userId => User.findById(userId)));
    // Extract relevant information from each user
    // const ratingUserNames = ratingUsers.map(user => user ? `${user.firstName} ${user.lastName}` : "Unknown");

    // Extract relevant information from each user
    const ratingDetails = product.ratings.map((rating, index) => ({
        rating: {
            _id: rating._id,
            userName: ratingUsers[index] ? `${ratingUsers[index].firstName} ${ratingUsers[index].lastName}` : "Unknown",
            title: rating.title,
            rating: rating.rating,
            description: rating.description,
            // userId: rating.userId,
            // productId: rating.productId,
        },
    }));

    res.status(200).json({
        msg: `Product fetched successfully`,
        success: true,
        data: {
            product: {
                _id: product._id,
                owner: product.owner,
                categoryName,
                name: product.name,
                description: product.description,
                price: product.price,
                availableInStock: product.availableInStock,
                imageUrl: product.imageUrl,
                cartItems: product.cartItems,
                favorits: product.favorits,
                averageRating: product.averageRating,
                ratingCount,
                ratingDetails,
                ownerDetails
            }
        }
    });
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

// search Endpoin/API
const search = asyncWrapper(async (req, res, next) => {
    const { categoryName, productName, description, ownerName } = req.query;

    const query = {};

    if (categoryName) {
        // Make the search for category name case-insensitive
        const categoryRegex = new RegExp(categoryName, 'i');
        const category = await Category.findOne({ name: { $regex: categoryRegex } });

        if (category) {
            query.categoryId = category._id;
        } else {
            return res.status(400).json({ success: false, msg: 'Category not found' });
        }
    }

    if (productName) {
        query.name = { $regex: productName, $options: 'i' };
    }

    if (description) {
        query.description = { $regex: description, $options: 'i' };
    }

    if (ownerName) {
        query.owner = { $regex: ownerName, $options: 'i' };
    }

    const products = await Product.find(query);

    res.status(200).json({
        success: true,
        msg: 'Products fetched successfully',
        data: products,
    });
});

// filter Endpoin/API
const filter = asyncWrapper(async (req, res, next) => {
    const { topRated, newAdded, featured, popular, topSelling } = req.query;

    const query = {};

    // Populate the 'ratings' field for each product
    const products = await Product.find({})
        .populate({
            path: 'ratings',
            select: '-ratingId -__v'
        })

    if (topRated === 'true') {
        const filteredProducts = products.filter(product => product.averageRating >= 4.25);

        const productIds = filteredProducts.map((product) => product._id);

        query._id = { $in: productIds };
    }

    if (newAdded === 'true') {
        // If topRated is true, filter products with average rating above 4.0
        query.newAdded = true;
    }

    if (featured === 'true') {
        // If topRated is true, filter products with average rating above 4.0
        query.featured = true;
    }

    if (popular === 'true') {
        // If topRated is true, filter products with average rating above 4.0
        query.popular = true;
    }

    if (topSelling === 'true') {
        // If topRated is true, filter products with average rating above 4.0
        query.topSelling = true;
    }

    const filterdProducts = await Product.find(query)
        .populate({
            path: 'ratings',
            select: '-ratingId -__v'
        })

    // Access the virtual field 'averageRating' for each product
    const productsWithDetails = await Promise.all(filterdProducts.map(async (product) => {
        const categoryId = product.categoryId;
        const categoryName = await getCategoryNameById(categoryId);

        const averageRating = product.averageRating

        // Fetch user details for each rating
        const userIds = product.ratings.map(rating => rating.userId);
        const ratingUsers = await Promise.all(userIds.map(userId => User.findById(userId)));

        // Extract relevant information from each user
        const ratingDetails = product.ratings.map((rating, index) => ({
            rating: {
                _id: rating._id,
                userName: ratingUsers[index] ? `${ratingUsers[index].firstName} ${ratingUsers[index].lastName}` : "Unknown",
                title: rating.title,
                rating: rating.rating,
                description: rating.description,
            },
        }));

        return {
            _id: product._id,
            owner: product.owner,
            categoryName,
            name: product.name,
            description: product.description,
            price: product.price,
            availableInStock: product.availableInStock,
            imageUrl: product.imageUrl,
            cartItems: product.cartItems,
            favorits: product.favorits,
            averageRating,
            ratingCount: product.ratings.length,
            ratingDetails,
            newAdded: product.newAdded,
            featured: product.featured,
            popular: product.popular,
            topSelling: product.topSelling
        };

    }));

    // const averageRating = products.averageRating;
    // console.log(averageRating);

    res.status(200).json({
        msg: 'Products fetched successfully',
        success: true,
        data: { productsWithDetails }
    });
});




const getRelatedProducts = asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Build a query based on the healthStatus fields
    const healthStatusQuery = Object.keys(user.healthStatus)
        .filter(key => user.healthStatus[key])
        .map(key => ({ description: new RegExp(key, 'i') }));

    if (healthStatusQuery.length === 0) {
        return res.status(200).json({ success: true, data: [] }); // No healthStatus fields selected
    }

    // Find products matching the healthStatus criteria
    const products = await Product.find({ $or: healthStatusQuery });

    res.status(200).json({ success: true, data: products });
});


module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getRelatedProducts,
    search,
    filter
}
