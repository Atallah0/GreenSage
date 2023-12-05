const express = require('express');
const router = express.Router();

const User = require('../../models/userModel');
const asyncWrapper = require('../../middleware/asyncWrapper');
const { createCustomError } = require('../customError');
const config = require('../../config/config');
const jwt = require('jsonwebtoken');

router.post('/api/login', asyncWrapper(async (req, res, next) => {
    const { email, password } = req.body;

    console.log('Received email:', email);
    console.log('Received password:', password);

    const user = await User.findOne({ where: { email } });

    if (!user) {
        return next(createCustomError('Email or password does not match!', 400));
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);

    if (!isPasswordValid) {
        return next(createCustomError('Email or password does not match!', 400));
    }

    const jwToken = jwt.sign({ id: user.id, email: user.email }, config.development.jwt_secret);

    res.status(200).json({
        success: true,
        message: `Welcome Back ${user.firstName}!`,
        data: jwToken
    });
}));

module.exports = router;
