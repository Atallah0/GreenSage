const User = require('../models/userModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// createUser Endpoint/API
const createUser = asyncWrapper(async (req, res, next) => {
    const { name, email } = req.body;

    if (!name || !email) {
        console.log('Missing name or email');
        return next(createCustomError('Please provide both name and email', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        console.log('Duplicate email');
        return next(createCustomError('Email already exists', 400));
    }

    const user = await User.create({ name, email });

    console.log('User created successfully');
    res.status(201).json({
        msg: `User created successfully`,
        success: true,
        data: user,
    });
});

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

    const user = await User.findOne({ _id: userID })

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

    // Extract only "name" and "email" properties for comparison
    const existingUserData = {
        name: existingUser.name,
        email: existingUser.email,
    };

    // Check if the req.body is the same as existing user data
    if (JSON.stringify(existingUserData) === JSON.stringify(req.body)) {
        return next(createCustomError('Nothing to update', 400))
    }

    // console.log(JSON.stringify(existingUser.toObject()));
    // console.log(JSON.stringify(req.body));

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

    const deleteUser = await User.findByIdAndDelete({ _id: userID })

    // Check if the user exists
    if (!deleteUser) {
        return next(createCustomError(`No user with id: ${userID}`, 404));
    }

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
    deleteUser
};
