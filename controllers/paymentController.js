const Payment = require('../models/paymentModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// createPayment Endpoint/API
const createPayment = asyncWrapper(async (req, res, next) => {
    const { type } = req.body;

    // Create the payment entry
    const payment = await Payment.create({ type });

    res.status(201).json({
        msg: `Payment created successfully`,
        success: true,
        data: payment
    });
});

// getPayments Endpoint/API
const getPayments = asyncWrapper(async (req, res, next) => {
    const payments = await Payment.find({});

    res.status(200).json({
        msg: 'Payments retrieved successfully',
        success: true,
        data: payments
    });
});

// getPayment Endpoint/API
const getPayment = asyncWrapper(async (req, res, next) => {
    const { id: paymentId } = req.params;

    // Check if the paymentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
        return next(createCustomError(`Invalid payment ID: ${paymentId}`, 400));
    }

    const payment = await Payment.findById(paymentId).populate('orders');

    res.status(200).json({
        msg: 'Payment retrieved successfully',
        success: true,
        data: payment
    });
});

module.exports = {
    createPayment,
    getPayments,
    getPayment,
};
