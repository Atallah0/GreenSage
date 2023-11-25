require('dotenv').config({ path: '../.env' });
const process = require('process');
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

const categoryData = require('../utils/constants/categoryData.json');

const categoryCollection = client.db('Gorceriesdb').collection('categories');

categoryCollection.insertMany(categoryData, (err, result) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('Category data seeded successfully.');
    client.close();
});
