const express = require('express');
const router = express.Router();

const {
    fetchCart,
    addItemToCart,
    removeItemFromCart,
    removeProductFromCart,
    clearCart
} = require('../controllers/cartController')

router.get('/:id', fetchCart);
router.post('/:userId/items/:productId', addItemToCart);
router.delete('/:userId/items/:productId', removeItemFromCart);
router.delete('/:userId/products/:productId', removeProductFromCart);
router.delete('/:userId', clearCart);

module.exports = router;
