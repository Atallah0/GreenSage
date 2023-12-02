// ratingSeeder.js
require('dotenv').config({ path: '../.env' });
const { MongoClient, ObjectId } = require('mongodb');
const ratingData = require('../utils/constants/ratingData.json');

async function seedRatings() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();

        // Map the ratingData with new ObjectIds
        const ratingDataWithObjectIds = ratingData.map((rating) => ({
            ...rating,
            _id: new ObjectId(),
            userId: new ObjectId(rating.userId),
            productId: new ObjectId(rating.productId),
        }));

        const ratingsCollection = client.db('Gorceriesdb').collection('ratings');

        // Insert ratings into the database
        await ratingsCollection.insertMany(ratingDataWithObjectIds);

        console.log('Ratings data seeded successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

// Call the seedRatings function
seedRatings();
module.exports = seedRatings;
