require('dotenv').config({ path: '../.env' });
const { MongoClient, ObjectId } = require('mongodb');
const usersAddressesData = require('../utils/constants/userAddressData.json');

async function seedUsers() {
    const client = new MongoClient(process.env.MONGO_URI);

    try {
        await client.connect();

        // Generate ObjectId for the user
        const userAddressDataWithObjectIds = usersAddressesData.map((user) => {
            return {
                ...user,
                _id: new ObjectId(user._id),
                addresses: user.addresses.map((address) => ({
                    ...address,
                    _id: new ObjectId(address._id),
                })),
            };
        });

        const usersCollection = client.db('Gorceriesdb').collection('users');

        const result = await usersCollection.insertMany(userAddressDataWithObjectIds);

        console.log('Users and addresses data seeded successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

// Call the seedUsers function with the desired ObjectIds
seedUsers();
module.exports = seedUsers;



// require('dotenv').config({ path: '../.env' });
// const { MongoClient } = require('mongodb');
// const { ObjectId } = require('mongodb');

// async function seedUsers(userId, addressIds) {
//     const client = new MongoClient(process.env.MONGO_URI);

//     try {
//         await client.connect();

//         const usersAddressesData = require('../utils/constants/userAddressData.json');

//         // Generate ObjectId for the user
//         usersAddressesData._id = new ObjectId(userId);

//         // Add ObjectIds to each address
//         usersAddressesData.addresses.forEach((address) => {
//             const correspondingAddressId = addressIds.find((id) => address.street === id.street);
//             if (correspondingAddressId) {
//                 address._id = new ObjectId(correspondingAddressId._id);
//             } else {
//                 throw new Error(`No matching address ID found for street: ${address.street}`);
//             }
//         });

//         const usersCollection = client.db('Gorceriesdb').collection('users');

//         const result = await usersCollection.insertOne(usersAddressesData);

//         console.log('Users and addresses data seeded successfully.');
//     } catch (err) {
//         console.error(err);
//     } finally {
//         await client.close();
//     }
// }

// // Call the seedUsers function with the desired ObjectIds
// seedUsers('6561586857cd62784448e981', [
//     { street: '123 Main Street', _id: '6561586857cd62784448e982' },
//     { street: '456 Oak Avenue', _id: '6561586857cd62784448e983' },
// ]);