const Cart = require('../models/cartModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const asyncWrapper = require('../middleware/asyncWrapper');
const { createCustomError } = require('../utils/customError');
const { Decimal128 } = require('mongodb');
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

// addItemToCart Endpoint/API
const addItemToCart = asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    let quantity = req.body.quantity;

    // logging the process
    console.log('Adding Item to Cart with userId: ' + userId);

    // fetch the user and cart and product
    const fetchedProduct = await Product.findById(productId);
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ userId });

    // If the fetched product does not exist
    if (!fetchedProduct) {
        return next(createCustomError(`Product does not exist`, 404));
    }
    if (!user) {
        return next(createCustomError(`User does not exist`, 404));
    }

    // Check if the cart already contains the product
    const existingCartItem = cart.cartItems.find(item => item.productId.equals(productId));

    if (existingCartItem) {
        // If the cart item already exists, update the quantity
        const totalQuantity = existingCartItem.quantity + quantity;

        if (totalQuantity > fetchedProduct.availableInStock) {
            return res.status(200).json({
                success: false,
                message: 'Required quantity more than the available',
                available_quantity: fetchedProduct.availableInStock,
            });
        }

        const newTotal = parseFloat(cart.totalPrice) + existingCartItem.price * quantity;

        // Update the cart's total price and existing cart item's quantity
        await Cart.findByIdAndUpdate(cart._id, {
            totalPrice: newTotal,
        });

        await Cart.findOneAndUpdate(
            { _id: cart._id, 'cartItems.productId': existingCartItem.productId },
            { $set: { 'cartItems.$.quantity': totalQuantity } }
        );

        return res.status(200).json({
            success: true,
            message: `Item Added to Cart Successfully`,
            data: existingCartItem,
        });
    } else {
        // If the cart item does not exist, create a new cart item
        const price = fetchedProduct.price;
        const newCartItem = {
            price,
            quantity,
            productId: fetchedProduct.id,
        };

        // Update the cart's total price and add the new cart item
        const newTotal = parseFloat(cart.totalPrice) + price * quantity;

        await Cart.findByIdAndUpdate(cart._id, {
            totalPrice: newTotal,
            $push: { cartItems: newCartItem },
        });

        return res.status(200).json({
            success: true,
            message: `Item Added to Cart Successfully`,
            data: newCartItem,
        });
    }
});

// // removeItemFromCart Endpoint/API
// const removeItemFromCart = asyncWrapper(async (req, res, next) => {
//     const userId = req.params.userId;
//     const productId = req.params.productId;

//     // logging the process
//     console.log('Removing Item from Cart with userId: ' + userId);

//     // fetch the cart and product
//     const cart = await Cart.findOne({ userId });
//     const productToRemove = await Product.findById(productId);

//     // If the product to remove does not exist
//     if (!productToRemove) {
//         return next(createCustomError(`Product does not exist`, 404));
//     }

//     // Check if the cart contains the product
//     const existingCartItem = cart.cartItems.find(item => item.productId.equals(productId));

//     if (existingCartItem) {
//         // Calculate the new total price and remove the item from the cart
//         const newTotal = parseFloat(cart.totalPrice) - existingCartItem.price * existingCartItem.quantity;

//         await Cart.findByIdAndUpdate(cart._id, {
//             totalPrice: newTotal,
//             $pull: { cartItems: { productId: existingCartItem.productId } },
//         });

//         return res.status(200).json({
//             success: true,
//             message: `Item Removed from Cart Successfully`,
//             data: existingCartItem,
//         });
//     } else {
//         return res.status(200).json({
//             success: false,
//             message: 'Item not found in the cart',
//         });
//     }
// });

// removeItemFromCart Endpoint/API
const removeItemFromCart = asyncWrapper(async (req, res, next) => {
    const userId = req.params.userId;
    const productId = req.params.productId;

    // logging the process
    console.log('Removing Item from Cart with userId: ' + userId);

    // fetch the cart and product
    const cart = await Cart.findOne({ userId });
    const productToRemove = await Product.findById(productId);

    // If the product to remove does not exist
    if (!productToRemove) {
        return next(createCustomError(`Product does not exist`, 404));
    }

    // Check if the cart contains the product
    const existingCartItem = cart.cartItems.find(item => item.productId.equals(productId));

    if (existingCartItem) {
        if (existingCartItem.quantity === 1 /*|| !req.body.quantity*/) {
            // If product quantity is 1 or no quantity is provided, remove the entire product
            const newTotal = parseFloat(cart.totalPrice) - existingCartItem.price * existingCartItem.quantity;

            await Cart.findByIdAndUpdate(cart._id, {
                totalPrice: newTotal,
                $pull: { cartItems: { productId: existingCartItem.productId } },
            });

            return res.status(200).json({
                success: true,
                message: `Item Removed from Cart Successfully`,
                data: existingCartItem,
            });
        } else if (existingCartItem.quantity > 1) {
            // If product quantity is more than 1, decrease it by one
            const newTotal = parseFloat(cart.totalPrice) - existingCartItem.price;

            await Cart.findOneAndUpdate(
                { _id: cart._id, 'cartItems.productId': existingCartItem.productId },
                { $inc: { 'cartItems.$.quantity': -1 }, totalPrice: newTotal }
            );

            return res.status(200).json({
                success: true,
                message: `Quantity Decreased by 1 for the Item in Cart`,
                data: existingCartItem,
            });
        }
    } else {
        return res.status(200).json({
            success: false,
            message: 'Item not found in the cart',
        });
    }
});

module.exports = {
    fetchCart,
    addItemToCart,
    removeItemFromCart,
}