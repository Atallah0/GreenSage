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
    getUserRelatedProducts,
    search,
    filter,
    searchAndFilter
} = require('../controllers/productController')

router.post('/', passport.authenticate('jwt', { session: false }), isOwner, createProduct);
router.get('/v1/query', getProducts);
router.get('/:id', getProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.get('/users/:userId/v1/query', getUserRelatedProducts)
router.get('/v1/search/v1/query', search)
router.get('/v1/filter/v1/query', filter)
router.get('/v1/searchFilter/v1/query', searchAndFilter)


module.exports = router;
