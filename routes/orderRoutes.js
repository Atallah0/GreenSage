const express = require('express');
const router = express.Router();

const { isOwner, isCustomer, hasAccessToOwnData } = require('../middleware/authMiddleware');
const passport = require('passport');
require('../utils/auth/passport');

const {
    createOrder,
    getOrders,
    getOrdersForUser,
    updateOrderStatus
} = require('../controllers/orderController')

router.post('/:id', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrdersForUser);
router.put('/:id', passport.authenticate('jwt', { session: false }), isOwner, hasAccessToOwnData, updateOrderStatus);


module.exports = router;
