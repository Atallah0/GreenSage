const express = require('express');
const router = express.Router();

const User = require('../../models/userModel');
const asyncWrapper = require('../../middleware/asyncWrapper');
const { createCustomError } = require('../customError');
require('dotenv').config({ path: '../../.env' });
const jwt = require('jsonwebtoken');

router.post('/api/login', asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    console.log('Received email:', email);
    console.log('Received password:', password);

    const user = await User.findOne({ email });

    if (!user) {
        return next(createCustomError('Email or password does not match!', 400));
    }

    if (user.password !== password) {
        return next(createCustomError('Email or password does not match!', 400));
    }

    // Set the expiration time to 1 hour (3600 seconds)
    const expiresIn = 3600;

    const jwToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {expiresIn});

    res.status(200).json({
        success: true,
        message: `Welcome Back ${user.firstName}!`,
        data: jwToken
    });
}));

module.exports = router;
