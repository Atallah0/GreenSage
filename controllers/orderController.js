const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// createOrder Endpoint/API
const createOrder = asyncWrapper(async (req, res, next) => {
    const { id: userId } = req.params;
    const { deliveryFee, paymentId, shippingId } = req.body;

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid userId ID: ${userId}`, 400));
    }

    if (!deliveryFee || !paymentId || !shippingId) {
        return next(createCustomError('Missing required properties in the request body', 400));
    }

    // Find the cartId based on the userId
    const cart = await Cart.findOne({ userId });

    if (!cart) {
        return next(createCustomError('Cart not found for the given user', 404));
    }

    console.log(cart);
    // Extract necessary details from the cart
    const { totalPrice, cartItems } = cart;

    // Calculate totalPrice by subtracting deliveryFee
    const adjustedTotalPrice = totalPrice - parseFloat(deliveryFee);

    // Create the order entry
    const order = await Order.create({
        userId,
        date: new Date(),
        deliveryFee,
        paymentId,
        shippingId,
    });

    res.status(201).json({
        msg: 'Order created successfully',
        success: true,
        data: {
            order,
            totalPrice: adjustedTotalPrice,
            cartItems,
        },
    });
});

// getOrders Endpoint/API
const getOrders = asyncWrapper(async (req, res, next) => {
    const orders = await Order.find();

    res.status(200).json({
        success: true,
        msg: 'Orders fetched successfully',
        data: orders,
    });
});


module.exports = {
    createOrder,
    getOrders,
};
