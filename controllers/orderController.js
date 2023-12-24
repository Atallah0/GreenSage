const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const Shipping = require('../models/shippingModel');
const Product = require('../models/productModel')
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const { DELIVERY_FEES } = require('../constants');
const mongoose = require('mongoose');


//ToDO if cart is empty
// createOrder Endpoint/API
const createOrder = asyncWrapper(async (req, res, next) => {
    const { id: userId } = req.params;
    const { paymentId, shippingId, userAddressIndex } = req.body;

    console.log(userAddressIndex);

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid userId ID: ${userId}`, 400));
    }

    if (!paymentId || !shippingId) {
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
    const adjustedTotalPrice = totalPrice + parseFloat(DELIVERY_FEES);

    // ------------------------------------------------------------------  errors
    const user = await User.findById(userId);
    const payment = await Payment.findById(paymentId);
    const shipment = await Shipping.findById(shippingId);

    // Validate userAddressIndex against the number of addresses
    if (userAddressIndex < 0 || userAddressIndex >= user.addresses.length) {
        return next(createCustomError('Invalid userAddressIndex', 400));
    }

    // Get the selected address
    const selectedAddress = user.addresses[userAddressIndex];


    // Create the order entry
    const order = await Order.create({
        userId,
        date: new Date(),
        deliveryFee: DELIVERY_FEES,
        paymentId,
        shippingId,
        userAddress: selectedAddress,
        totalPrice: adjustedTotalPrice,
        cartItems
    });

    // Update product stock in the cart
    await updateProductStockInCart(order._id);

    // Update the associated category with the new product reference
    await user.updateOne(
        { $push: { orders: order._id } },
        { new: true }
    );

    await payment.updateOne(
        { $push: { orders: order._id } },
        { new: true }
    );

    await shipment.updateOne(
        { $push: { orders: order._id } },
        { new: true }
    );

    // Clear all items from the cart
    await Cart.findByIdAndUpdate(cart._id, {
        totalPrice: 0,
        $set: { cartItems: [] },
    });

    // Remove the cart item from the Product model's cartItems array for all products
    await Product.updateMany({
        cartItems: cart._id,
    }, {
        $pull: { cartItems: cart._id },
    });

    res.status(201).json({
        msg: 'Order created successfully',
        success: true,
        data: order
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

// getOrdersForUser Endpoint/API
const getOrdersForUser = asyncWrapper(async (req, res, next) => {
    const { id: userId } = req.params;

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid userId ID: ${userId}`, 400));
    }

    // Find orders for the given user
    const orders = await Order.find({ userId })
    // .populate('paymentId', '-__v') // Add any additional fields to exclude if needed
    // .populate('shippingId', '-__v') // Add any additional fields to exclude if needed
    // .exec();

    res.status(200).json({
        success: true,
        msg: 'Orders fetched successfully for the user',
        data: orders,
    });
});

// Function to update product stock in the cart
const updateProductStockInCart = async (orderId) => {
    const order = await Order.findById(orderId);

    if (!order) {
        throw new Error('Order not found');
    }

    for (const cartItem of order.cartItems) {
        const productId = cartItem.productId;
        const quantityBought = cartItem.quantity;

        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        if (quantityBought > product.availableInStock) {
            throw new Error('Insufficient stock for the product');
        }

        product.availableInStock -= quantityBought;
        await product.save();
    }
};

module.exports = {
    createOrder,
    getOrders,
    getOrdersForUser
};
