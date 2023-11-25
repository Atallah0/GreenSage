// categorySeeder.js
require('dotenv').config({ path: '../.env' });
const { MongoClient, ObjectId } = require('mongodb');
const categoryData = require('../utils/constants/categoryData.json');
const productData = require('../utils/constants/productData.json');

async function seedCategories() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();

        // Map the categoryData with new ObjectIds
        const categoryDataWithObjectIds = categoryData.map((category) => ({
            ...category,
            _id: new ObjectId(category._id),
            products: getProductsForCategory(productData, category._id),
        }));

        const categoriesCollection = client.db('Gorceriesdb').collection('categories');

        // Insert categories into the database
        await categoriesCollection.insertMany(categoryDataWithObjectIds);

        console.log('Categories data seeded successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

// Get products associated with a category with ObjectId values
function getProductsForCategory(allProducts, categoryId) {
    return allProducts
        .filter((product) => product.categoryId === categoryId)
        .map((product) => new ObjectId(product._id));
}

// Call the seedCategories function
seedCategories();
module.exports = seedCategories;