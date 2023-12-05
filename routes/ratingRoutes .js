const express = require('express');
const router = express.Router();

const {
    createRating,
    getRatings,
    getRating,
    updateRating,
    deleteRating
} = require('../controllers/ratingController')

router.post('/', createRating);
router.get('/', getRatings);
router.get('/:id', getRating);
router.put('/:id', updateRating);
router.delete('/:id', deleteRating);

module.exports = router;
