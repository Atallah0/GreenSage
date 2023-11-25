require('dotenv').config({ path: '../.env' });
const { MongoClient, ObjectId } = require('mongodb');
const additionalAddressesData = require('../utils/constants/addressData.json');

async function seedAddresses() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();

        const userId = '65615e50943599dfa17008fe';

        const usersCollection = client.db('Gorceriesdb').collection('users');

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { addresses: { $each: additionalAddressesData } } }
        );

        console.log('Addresses data seeded successfully.');

    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

seedAddresses();
