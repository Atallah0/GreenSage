const Shipping = require('../models/shippingModel');
const User = require('../models/userModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// createShipping Endpoint/API
const createShipping = asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;
    const { userAddressIndex } = req.body;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid user ID: ${userId}`, 400));
    }

    // Fetch the user with detailed address information
    const user = await User.findById(userId);

    if (!user) {
        return next(createCustomError('User not found', 404));
    }

    // Validate userAddressIndex against the number of addresses
    if (userAddressIndex < 0 || userAddressIndex >= user.addresses.length) {
        return next(createCustomError('Invalid userAddressIndex', 400));
    }

    // Get the selected address
    const selectedAddress = user.addresses[userAddressIndex];

    console.log(selectedAddress);

    // Create the shipping entry
    const shipping = await Shipping.create({
        userId,
        userAddressIndex,
        status: 'pending',
        userAddress: selectedAddress
    });

    await shipping.save();

    res.status(201).json({
        msg: `Shipping created successfully`,
        success: true,
        data: shipping
    });
});

const getShipments = asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;

    // Fetch all shipments for the user
    const shipments = await Shipping.find({ userId });

    res.status(200).json({
        msg: 'Shipments retrieved successfully',
        success: true,
        data: shipments
    });
});

module.exports = {
    createShipping,
    getShipments,
};