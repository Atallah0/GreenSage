const express = require('express');
const router = express.Router();

const {
    fetchFavorite,
    addIItemToFavorite,
    removeItemFromFavorite,
    clearFavorites
} = require('../controllers/favoriteController')

router.get('/:id', fetchFavorite);
router.post('/:userId/items/:productId', addIItemToFavorite);
router.delete('/:userId/items/:productId', removeItemFromFavorite);
router.delete('/:userId', clearFavorites);

module.exports = router;
