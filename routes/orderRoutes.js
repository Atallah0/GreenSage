const express = require('express');
const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrdersForUser
} = require('../controllers/orderController')

router.post('/:id', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrdersForUser);

module.exports = router;
