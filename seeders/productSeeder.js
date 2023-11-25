// productSeeder.js
require('dotenv').config({ path: '../.env' });
const { MongoClient, ObjectId } = require('mongodb');
const productData = require('../utils/constants/productData.json');

async function seedProducts() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();

        // Map the productData with new ObjectIds
        const productDataWithObjectIds = productData.map((product) => ({
            ...product,
            _id: new ObjectId(product._id),
            categoryId: new ObjectId(product.categoryId),
        }));

        const productsCollection = client.db('Gorceriesdb').collection('products');

        // Insert products into the database
        await productsCollection.insertMany(productDataWithObjectIds);

        console.log('Products data seeded successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

// Call the seedProducts function
seedProducts();
module.exports = seedProducts;