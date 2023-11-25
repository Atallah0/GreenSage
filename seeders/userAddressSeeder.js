require('dotenv').config({ path: '../.env' });
const { MongoClient } = require('mongodb');

async function seedUsers() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();

        const usersAddressesData = require('../utils/constants/userAddressData.json');
        const usersCollection = client.db('Gorceriesdb').collection('users');

        const result = await usersCollection.insertOne(usersAddressesData);

        console.log('Users and addresses data seeded successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

seedUsers();
