const User = require('../models/userModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// addAddress Endpoint/API
const addAddress = asyncWrapper(async (req, res, next) => {
    const { id: userID } = req.params;
    const { street, postalCode, state, city } = req.body;

    const user = await User.findById(userID);
    if (!user) {
        return next(createCustomError('User not found', 404));
    }

    const newAddress = {
        street,
        postalCode,
        state,
        city,
    };

    user.addresses.push(newAddress);
    await user.save();

    res.status(200).json({
        msg: 'Address added successfully',
        success: true,
        data: user,
    });
});

// getAddresses Endpoint/API
const getAddresses = async (req, res, next) => {
    const { id: userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
        return next(createCustomError('User not found', 404));
    }

    res.status(200).json({
        msg: 'Addresses retrieved successfully',
        success: true,
        data: user.addresses,
    });
};

// getAddress Endpoint/API
const getAddress = async (req, res, next) => {
    // const { id: userId } = req.params;
    const userId = req.params.userId;
    const addressId = req.params.addressId;

    console.log(userId);
    console.log(addressId);

    const user = await User.findById(userId);
    if (!user) {
        return next(createCustomError('User not found', 404));
    }

    const address = user.addresses.id(addressId);
    if (!address) {
        return next(createCustomError('Address not found', 404));
    }

    res.status(200).json({
        msg: 'Address retrieved successfully',
        success: true,
        data: address,
    });
};

// updateAddress Endpoint/API
const updateAddress = async (req, res, next) => {
    const userId = req.params.userId;
    const addressId = req.params.addressId;
    const { street, postalCode, state, city } = req.body;

    const user = await User.findById(userId);
    if (!user) {
        return next(createCustomError('User not found', 404));
    }

    const address = user.addresses.id(addressId);
    if (!address) {
        return next(createCustomError('Address not found', 404));
    }

    const addressData = {
        street: address.street,
        postalCode: address.postalCode,
        state: address.state,
        city: address.city,
    }

    // Check if the req.body is the same as existing address data
    if (JSON.stringify(addressData) === JSON.stringify(req.body)) {
        return next(createCustomError('Nothing to update', 400))
    }

    console.log(JSON.stringify(addressData));
    console.log(JSON.stringify(req.body));

    // address.street = street;  or 
    address.street = street || address.street;
    address.postalCode = postalCode || address.postalCode;
    address.state = state || address.state;
    address.city = city || address.city;

    await user.save();

    res.status(200).json({
        msg: 'Address updated successfully',
        success: true,
        data: address,
    });
};

// deleteAddress Endpoint/API
const deleteAddress = async (req, res, next) => {
    const userId = req.params.userId;
    const addressId = req.params.addressId;

    const user = await User.findById(userId);
    if (!user) {
        return next(createCustomError('User not found', 404));
    }

    const address = user.addresses.id(addressId);
    if (!address) {
        return next(createCustomError('Address not found', 404));
    }

    address.deleteOne();
    await user.save();

    res.status(200).json({
        msg: 'Address deleted successfully',
        success: true,
        data: address,
    });
};

// deleteAllAddresses Endpoint/API
const deleteAllAddresses = async (req, res, next) => {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
        return next(createCustomError('User not found', 404));
    }

    user.addresses = [];
    await user.save();

    res.status(200).json({
        msg: 'All addresses deleted successfully',
        success: true,
        data: user.addresses,
    });
};


module.exports = {
    addAddress,
    getAddresses,
    getAddress,
    updateAddress,
    deleteAddress,
    deleteAllAddresses
}