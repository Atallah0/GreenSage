const express = require('express');
const router = express.Router();

const {
    fetchFavorite,
    addIItemToFavorite
} = require('../controllers/favoriteController')

router.get('/:id', fetchFavorite);
router.post('/:userId/items/:productId', addIItemToFavorite);
// router.delete('/:userId/items/:productId', );
// router.delete('/:userId', );

module.exports = router;
