const express = require('express');
const router = express.Router();

const { isOwner, isCustomer, hasAccessToOwnData } = require('../middleware/authMiddleware');
const passport = require('passport');
require('../utils/auth/passport');

const {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct,
    getRelatedProducts,
    search
} = require('../controllers/productController')

router.post('/', passport.authenticate('jwt', { session: false }), isOwner, createProduct);
router.get('/v1/query', getProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/users/:userId', getRelatedProducts)
router.get('/v1/search/', search)


module.exports = router;
