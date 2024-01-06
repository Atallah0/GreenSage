const Category = require('../models/categoryModel');
const Product = require('../models/productModel');

const fetchRelatedProducts = async (productId, limit = 3) => {
    try {
        const product = await Product.findById(productId);

        if (!product) {
            // Handle the case where the product is not found
            throw new Error(`No product with id: ${productId} is found`);
        }

        const category = await Category.findById(product.categoryId);

        if (!category) {
            // Handle the case where the category is not found
            throw new Error(`No category with id: ${product.categoryId} is found`);
        }

        const allRelatedProducts = await Product.find({
            _id: { $ne: productId },
            categoryId: category._id,
        }).populate('ratings', '-ratingId -__v')
            .lean();

        // Shuffle the array randomly
        const shuffledProducts = allRelatedProducts.sort(() => Math.random() - 0.5);

        // Limit the result to the specified limit
        const relatedProducts = shuffledProducts.slice(0, 3);


        return relatedProducts;
    } catch (error) {
        // Handle any other errors
        console.error(error.message);
        throw error;
    }
};

// Helper function to apply filter logic on search results
const applyFilterLogic = (products, { topRated, newAdded, featured, popular, topSelling }) => {
    let filteredResults = products;

    if (topRated === 'true') {
        const ratingThreshold = 3.50; // Set your desired rating threshold
        filteredResults = filteredResults.filter(product => product.averageRating >= ratingThreshold);
    }

    if (newAdded === 'true') {
        filteredResults = filteredResults.filter(product => product.newAdded === true);
    }

    if (featured === 'true') {
        filteredResults = filteredResults.filter(product => product.featured === true);
    }

    if (popular === 'true') {
        filteredResults = filteredResults.filter(product => product.popular === true);
    }

    if (topSelling === 'true') {
        filteredResults = filteredResults.filter(product => product.topSelling === true);
    }

    return filteredResults;
};

module.exports = {
    fetchRelatedProducts,
    applyFilterLogic
};
