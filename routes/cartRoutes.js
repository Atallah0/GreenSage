const express = require('express');
const router = express.Router();

const {
    fetchCart,
    addItemToCart,
    removeItemFromCart,
} = require('../controllers/cartController')

router.get('/:id', fetchCart);
router.post('/:userId/items/:productId', addItemToCart);
router.delete('/:userId/items/:productId', removeItemFromCart)

// router.put('/:id',);
// router.delete('/:id',);

module.exports = router;
