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

module.exports = { fetchRelatedProducts };
