const express = require('express');
const router = express.Router();

const {
    fetchCart,
} = require('../controllers/cartController')

router.get('/:id', fetchCart);
// router.put('/:id',);
// router.delete('/:id',);

module.exports = router;
