const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
// const Shipping = require('../models/shippingModel');
const Product = require('../models/productModel')
const Notification = require('../models/notificationModel')
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const { DELIVERY_FEES } = require('../constants');
const mongoose = require('mongoose');
const { connectedUsers, emitOrderNotificationToConnectedUsers, OrdersStatus } = require('../socket');
require('dotenv').config({ path: '../.env' });
const stripe = require('stripe')(process.env.SECRET_KEY);

// createOrder Endpoint/API
const createOrder = asyncWrapper(async (req, res, next) => {
    const { id: userId } = req.params;
    const { shipmentStatus } = req.body;

    // console.log(userAddressIndex);

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid userId ID: ${userId}`, 400));
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
    const adjustedTotalPrice = Number(totalPrice) + DELIVERY_FEES;
    console.log(adjustedTotalPrice);

    // ------------------------------------------------------------------  errors
    const user = await User.findById(userId);
    // const payment = await Payment.findById(paymentId);

    // Validate userAddressIndex against the number of addresses
    // if (userAddressIndex < 0 || userAddressIndex >= user.addresses.length) {
    //     return next(createCustomError('Invalid userAddressIndex', 400));
    // }

    const userName = `${user.firstName} ${user.lastName}`;

    // Get the selected address
    const selectedAddress = user.addresses[0];

    if (cart.cartItems.length === 0) {
        return next(createCustomError(`Cart is empty`, 400))
    }

    // Create the order entry
    const order = await Order.create({
        userId,
        date: new Date(),
        deliveryFee: DELIVERY_FEES,
        shipmentStatus,
        userAddress: selectedAddress,
        totalPrice: adjustedTotalPrice,
        cartItems,
        userName
    });

    const cartItemsIds = cartItems.map(cartItem => cartItem._id)
    console.log(cartItemsIds);

    // Update product stock in the cart
    await updateProductStockInCart(order._id);

    // Update the associated category with the new product reference
    await user.updateOne(
        { $push: { orders: order._id } },
        { new: true }
    );

    // await payment.updateOne(
    //     { $push: { orders: order._id } },
    //     { new: true }
    // );

    // Clear all items from the cart
    await Cart.findByIdAndUpdate(cart._id, {
        totalPrice: 0,
        totalItems: 0,
        $set: { cartItems: [] },
    });

    // Remove the cart item from the Product model's cartItems array for all products
    await Product.updateMany(
        { cartItems: { $in: cartItemsIds } },
        { $pullAll: { cartItems: cartItemsIds } }
    );

    res.status(201).json({
        msg: 'Order created successfully',
        success: true,
        data: order
    });
});

const createPaymentIntent = asyncWrapper(async (req, res, next) => {
    const { userId, country } = req.body;
    // console.log(userId);
    // console.log(country);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid userId ID: ${userId}`, 400));
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
        return next(createCustomError('Cart not found for the given user', 404));
    }

    const { totalPrice } = cart;

    // Convert the total price to cents
    const adjustedTotalPrice = Math.round((Number(totalPrice) + DELIVERY_FEES) * 100);

    const user = await User.findById(userId);

    if (!user) {
        return next(createCustomError('User not found', 404));
    }

    // // Validate userAddressIndex against the number of addresses
    // if (userAddressIndex < 0 || userAddressIndex >= user.addresses.length) {
    //     return next(createCustomError('Invalid userAddressIndex', 400));
    // }

    // Get the selected address
    const selectedAddress = user.addresses[0];

    let stripeCustomer;

    if (!user.stripeCustomerId) {
        // If user does not have a Stripe customer ID, create a new customer
        stripeCustomer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            // Add other relevant customer details
        });

        // Update the user in your database with the new Stripe customer ID
        user.stripeCustomerId = stripeCustomer.id;
        await user.save();
    } else {
        // If user already has a Stripe customer ID, retrieve the customer
        stripeCustomer = await stripe.customers.retrieve(user.stripeCustomerId);
    }

    const { firstName, lastName, email, mobile } = user;
    const userName = `${firstName} ${lastName}`;

    if (cart.cartItems.length === 0) {
        return next(createCustomError('Cart is empty', 400));
    }

    const paymentIntent = await stripe.paymentIntents.create({
        customer: stripeCustomer.id,
        receipt_email: email,
        description: 'Your purchase description',
        shipping: {
            name: userName,
            phone: mobile,
            address: {
                city: selectedAddress.city,
                country,
                line1: selectedAddress.street,
                postal_code: selectedAddress.postalCode,
                state: selectedAddress.state,
            },
        },
        amount: adjustedTotalPrice,
        currency: 'usd',
    });

    console.log(paymentIntent);

    res.json({ clientSecret: paymentIntent.client_secret });
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
    const orders = await Order.find({ userId });

    const user = await User.findById({ _id: userId })
    const userName = `${user.firstName} ${user.lastName}`;

    const paymentIds = orders.map(order => order.paymentId);

    // Fetch payment details for each paymentId
    const paymentType = await Promise.all(paymentIds.map(async (paymentId) => {
        const payment = await Payment.findById(paymentId);
        return payment ? payment.type : "Unknown";
    }));

    console.log(userName);
    console.log(paymentType);

    // Combine userName and paymentType with each order
    const ordersWithDetails = orders.map((order, index) => ({
        ...order.toObject(), // Convert Mongoose document to plain JavaScript object
        userName,
        paymentType: paymentType[index],
    }));

    res.status(200).json({
        success: true,
        msg: 'Orders fetched successfully for the user',
        data: ordersWithDetails,
    });
});

// getOrder Endpoint/API
const getOrder = asyncWrapper(async (req, res, next) => {
    const { id: orderId } = req.params;

    // Check if the orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(createCustomError(`Invalid orderId ID: ${orderId}`, 400));
    }

    const order = await Order.findById(orderId);

    res.status(200).json({
        success: true,
        msg: 'Order fetched successfully',
        data: order,
    });

});

// updateOrderStatus Endpoint/API
const updateOrderStatus = asyncWrapper(async (req, res, next) => {
    const { id: orderId } = req.params;
    const { shipmentStatus } = req.body;

    // Check if the orderId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return next(createCustomError(`Invalid orderId ID: ${orderId}`, 400));
    }

    // Update the order status
    const updatedOrder = await Order.findByIdAndUpdate(
        { _id: orderId },
        { shipmentStatus },
        { new: true, runValidators: true }
    );

    if (!updatedOrder) {
        return next(createCustomError(`No order found with id: ${orderId}`, 404));
    }

    // // Emit a notification to the user using socket.io
    const userId = updatedOrder.userId.toString();

    // Emit a notification to the user with the updated order status
    const orderStatusUpdated = {
        orderId: updatedOrder._id,
        shipmentStatus: updatedOrder.shipmentStatus,
    };

    console.log(orderStatusUpdated);

    emitOrderNotificationToConnectedUsers(orderStatusUpdated, userId);

    let userIsConnected = false;

    // Iterate over the values in the connectedUsers Map
    for (const connectedUser of connectedUsers.values()) {
        // Check if the user ID matches
        if (connectedUser._id.toString() === userId) {
            console.log(`User with ID ${userId} is currently connected, skipping notification storage`);
            userIsConnected = true;

            const newNotification = new Notification({
                userId: connectedUser._id,
                status: orderStatusUpdated
            });
            await newNotification.save();

            break; // Exit the inner loop since we found the user
        }
    }

    // If the user is not connected, store the notification
    if (!userIsConnected) {
        console.log(`Notification stored for not connected user with ID: ${userId}`);
        if (!OrdersStatus.has(userId)) {
            OrdersStatus.set(userId, []);
        }
        OrdersStatus.get(userId).push(orderStatusUpdated);
    }

    res.status(200).json({
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder,
    });
});


// getOwnerOrders Endpoint/API
const getOwnerOrders = asyncWrapper(async (req, res, next) => {
    const { id: userId } = req.params;

    // Check if the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return next(createCustomError(`Invalid orderId ID: ${userId}`, 400));
    }

    const user = await User.findById(userId);
    const fullName = `${user.firstName} ${user.lastName}`;
    // console.log(fullName);

    const orders = await Order.find({});
    const allCartItems = orders.flatMap(order => order.cartItems);

    const matchingCartItems = allCartItems.filter(item => item.ownerName === fullName);
    // console.log(matchingCartItems);

    const matchingOrders = orders
        .filter(order => order.cartItems.some(cartItem => matchingCartItems.some(matchingItem => matchingItem._id.equals(cartItem._id))))
        .map(order => {
            const matchingOrder = {
                ...order.toObject(),
                cartItems: order.cartItems
                    .filter(cartItem => matchingCartItems.some(matchingItem => matchingItem._id.equals(cartItem._id)))
                    .flat(), // Flatten the cartItems array
            };

            // Calculate the correct total price for matchingOrder
            matchingOrder.totalPrice = matchingOrder.cartItems.reduce((total, cartItem) => total + cartItem.itemTotalPrice, 0);

            return matchingOrder;
        });

    const OrdersNumber = matchingOrders.length;

    res.status(200).json({
        success: true,
        message: 'Owner orders fetched successfully',
        data: { matchingOrders, OrdersNumber },
    });
});


module.exports = {
    createOrder,
    getOrders,
    getOrder,
    getOrdersForUser,
    updateOrderStatus,
    getOwnerOrders,
    createPaymentIntent
};