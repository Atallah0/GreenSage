const User = require('../models/userModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// createUser Endpoint/API
const createUser = asyncWrapper(async (req, res, next) => {
    const { firstName, lastName, email, mobile, password, imageUrl, addresses } = req.body;

    if (!firstName || !lastName || !email || !mobile || !password || !imageUrl || !addresses) {
        console.log('Missing required fields');
        return next(createCustomError('Please provide all required fields', 400));
    }
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log('Duplicate email');
        return next(createCustomError('Email already exists', 400));
    }

    const userAddresses = addresses.map(address => ({
        street: address.street,
        postalCode: address.postalCode,
        state: address.state,
        city: address.city,
    }));

    const user = await User.create({
        firstName,
        lastName,
        email,
        mobile,
        password,
        imageUrl,
        role: 'owner',
        addresses: userAddresses,
    });

    console.log('User created successfully');
    res.status(201).json({
        msg: `User created successfully`,
        success: true,
        data: user,
    });
});

// // addAddress Endpoint/API
// const addAddress = asyncWrapper(async (req, res, next) => {
//     const { id: userID } = req.params;
//     const { street, postalCode, state, city } = req.body;

//     const user = await User.findById(userID);
//     if (!user) {
//         return next(createCustomError('User not found', 404));
//     }

//     const newAddress = {
//         street,
//         postalCode,
//         state,
//         city,
//     };

//     user.addresses.push(newAddress);
//     await user.save();

//     res.status(200).json({
//         msg: 'Address added successfully',
//         success: true,
//         data: user,
//     });
// });



// getUsers Endpoint/API
const getUsers = asyncWrapper(async (req, res, next) => {
    const users = await User.find({});
    res.status(200).json({
        msg: `Users fetched successfully`,
        success: true,
        data: users
    })
});

// getUser Endpoint/API
const getUser = asyncWrapper(async (req, res, next) => {
    const { id: userID } = req.params;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return next(createCustomError(`Invalid user ID: ${userID}`, 400));
    }

    // Fetch the user and populate its 'ratings' field
    // const user = await User.findOne({ _id: userID })
    const user = await User.findById(userID)
        .populate('ratings', '-ratingId -__v')
        .populate('orders');


    // Check if the user exists
    if (!user) {
        return next(createCustomError(`No user with id: ${userID}`, 404));
    }

    res.status(200).json({
        msg: 'User fetched successfully',
        success: true,
        data: user
    })
});

// updateUser Endpoint/API
const updateUser = asyncWrapper(async (req, res, next) => {
    const { id: userID } = req.params;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return next(createCustomError(`Invalid user ID: ${userID}`, 400));
    }

    // Fetch the existing user data
    const existingUser = await User.findById(userID);

    // Check if the user exists
    if (!existingUser) {
        return next(createCustomError(`No user with id: ${userID}`, 404));
    }

    // Extract only "name" and "email" properties for comparison
    const existingUserData = {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        mobile: existingUser.mobile,
        password: existingUser.password,
        imageUrl: existingUser.imageUrl
        // addresses: existingUser.addresses

    };

    // Check if the req.body is the same as existing user data
    if (JSON.stringify(existingUserData) === JSON.stringify(req.body)) {
        return next(createCustomError('Nothing to update', 400))
    }

    console.log(JSON.stringify(existingUserData));
    console.log(JSON.stringify(req.body));

    // Update the user data
    const updatedUser = await User.findOneAndUpdate({ _id: userID }, req.body, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        msg: `User updated successfully`,
        success: true,
        data: updatedUser,
    });
});

// deleteUser Endpoint/API
const deleteUser = asyncWrapper(async (req, res, next) => {
    const { id: userID } = req.params;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userID)) {
        return next(createCustomError(`Invalid user ID: ${userID}`, 400));
    }

    const user = await User.findById(userID)

    // Check if the user exists
    if (!user) {
        return next(createCustomError(`No user with id: ${userID}`, 404));
    }

    // const deletedUser = await user.deleteOne(); Or
    await user.deleteOne();

    res.status(200).json({
        msg: `user deleted successfully`,
        success: true
    })
});

module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
};
