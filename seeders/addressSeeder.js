require('dotenv').config({ path: '../.env' });
const { MongoClient, ObjectId } = require('mongodb');
const additionalAddressesData = require('../utils/constants/addressData.json');

async function seedAddresses() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();

        const userId = '6561586857cd62784448e981';
        const additionalAddressesWithObjectIds = additionalAddressesData.map((address) => {
            return {
                ...address,
                _id: new ObjectId(address._id),
            };
        });

        const usersCollection = client.db('Gorceriesdb').collection('users');

        // const result = await usersCollection.updateOne(
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $push: { addresses: { $each: additionalAddressesWithObjectIds } } },
        );

        console.log('Addresses data seeded successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

seedAddresses();
module.exports = seedAddresses;