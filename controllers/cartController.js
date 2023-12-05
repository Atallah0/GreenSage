const Cart = require('../models/cartModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const mongoose = require('mongoose');

// fetchCart Endpoint/API
const fetchCart = asyncWrapper(async (req, res, next) => {
    // const userId = req.body.userId; // Changed later to fetch from the jwt token
    const { id: userId } = req.params;


    // logging the process
    console.log('Fetching Cart from userId:' + userId);

    // Fetching the cart based on the user
    const cart = await Cart.findOne({ userId });

    // If the cart is not found return error
    if (!cart) {
        console.log(`Error Fetching Cart from userId: ${userId}`);
        return next(createCustomError(`Invalid User`, 403));
    }

    // The cart is Fetched and returned in the response
    console.log(`Fetching Cart from userId(${userId}) Successfully`);
    return res.status(200).json({
        success: true,
        message: `Cart successfully Fetched`,
        data: cart,
    });
});

module.exports = {
    fetchCart,
}