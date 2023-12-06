const express = require('express');
const router = express.Router();

const {
    fetchCart,
    addItemToCart,
    removeItemFromCart,
    clearCart
} = require('../controllers/cartController')

router.get('/:id', fetchCart);
router.post('/:userId/items/:productId', addItemToCart);
router.delete('/:userId/items/:productId', removeItemFromCart);
router.delete('/:userId', clearCart);

module.exports = router;
