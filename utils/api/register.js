const asyncWrapper = require('../../middleware/asyncWrapper');
const { createCustomError } = require('../customError');

const express = require('express');
const router = express.Router();

const User = require('../../models/userModel');
const Cart = require('../../models/cartModel');
const Favorite = require('../../models/favoriteModel');


router.post('/api/register', asyncWrapper(async (req, res, next) => {
    const { firstName, lastName, email, mobile, password, imageUrl, addresses, healthStatus } = req.body;

    if (!firstName || !lastName || !email || !mobile || !password || !imageUrl || !addresses) {
        return next(createCustomError('Please provide all required fields', 400));
    }

    const alreadyExistsUser = await User.findOne({ where: { email } }).catch((err) => {
        console.log('Error:', err);
    });

    if (alreadyExistsUser) {
        return next(createCustomError(`User with ${email} already exists`, 400));
    }

    const userAddresses = addresses.map(address => ({
        street: address.street,
        postalCode: address.postalCode,
        state: address.state,
        city: address.city,
    }));

    // // Filter the healthStatus object to include only true values
    // const filteredHealthStatus = Object.fromEntries(
    //     Object.entries(healthStatus).filter(([key, value]) => value === true)
    // );

    const newUser = await User.create({
        firstName,
        lastName,
        email,
        mobile,
        password,
        imageUrl,
        role: 'customer',
        addresses: userAddresses,
        healthStatus // Set healthStatus object with only true values
    });

    const savedUser = await newUser.save().catch((err) => {
        console.log('Error: ', err);
        return next(createCustomError(`Can't register user at the moment`, 400));
    });

    // Create the cart associated with the user
    const cart = await Cart.create({
        totalPrice: 0,
        userId: newUser._id,
    });
    // Create the favorite associated with the user
    const favorite = await Favorite.create({
        items: [],
        userId: newUser._id,
    });

    // Set the user's cart and favorite fields to the respective model's _id
    newUser.cart = cart._id;
    newUser.favorite = favorite._id;

    // Save the user with cart and favorite references
    await newUser.save();

    if (savedUser) {
        res.status(200).json({
            success: true,
            message: 'Thanks for registering',
        });
    }
}));

module.exports = router;
