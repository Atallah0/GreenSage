const express = require('express');
const router = express.Router();

const {
    fetchCart,
    addItemToCart,
} = require('../controllers/cartController')

router.get('/:id', fetchCart);
router.post('/:userId/items/:productId', addItemToCart)
// router.put('/:id',);
// router.delete('/:id',);

module.exports = router;
