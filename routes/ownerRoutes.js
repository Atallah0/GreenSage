const express = require('express');
const router = express.Router();

const { isOwner, isCustomer, hasAccessToOwnData } = require('../middleware/authMiddleware');
const passport = require('passport');
require('../utils/auth/passport');

const {
    getOwners,
    getOwner
} = require('../controllers/userController')

router.get('/', getOwners);
router.get('/:id/v1/query', getOwner);


module.exports = router;

