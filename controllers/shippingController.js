const Shipping = require('../models/shippingModel');
const User = require('../models/userModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// createShipping Endpoint/API
const createShipping = asyncWrapper(async (req, res, next) => {
    const { status } = req.body;

    // Create the shipping entry
    const shipping = await Shipping.create({ status });

    res.status(201).json({
        msg: `Shipping created successfully`,
        success: true,
        data: shipping
    });
});

// getShipments Endpoin/API
const getShipments = asyncWrapper(async (req, res, next) => {
    const shipments = await Shipping.find({});

    res.status(200).json({
        msg: 'Shipments retrieved successfully',
        success: true,
        data: shipments
    });
});

// getShipment Endpoin/API
const getShipment = asyncWrapper(async (req, res, next) => {
    const { id: shippingId } = req.params;

    // Check if the userID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(shippingId)) {
        return next(createCustomError(`Invalid shippinId ID: ${shippingId}`, 400));
    }

    const shipment = await Shipping.findById(shippingId).populate('orders');;

    res.status(200).json({
        msg: 'Shipments retrieved successfully',
        success: true,
        data: shipment
    });
});



module.exports = {
    createShipping,
    getShipments,
    getShipment,
};