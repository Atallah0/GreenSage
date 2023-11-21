const User = require('../models/userModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');

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


module.exports = { createUser };
