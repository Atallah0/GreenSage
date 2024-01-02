const express = require('express');
const router = express.Router();

const { isOwner, isCustomer, hasAccessToOwnData } = require('../middleware/authMiddleware');
const passport = require('passport');
require('../utils/auth/passport');

const {
    getOwners,
    getOwner
} = require('../controllers/userController')

const {
    getOwnerOrders
} = require('../controllers/orderController')

router.get('/', getOwners);
router.get('/:id/v1/query', getOwner);
router.get('/:id', getOwnerOrders);

module.exports = router;

