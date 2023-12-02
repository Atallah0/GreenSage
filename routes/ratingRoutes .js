const express = require('express');
const router = express.Router();

const {
    createRating,
    getRatings
} = require('../controllers/ratingController')

router.post('/', createRating);
router.get('/', getRatings);
// router.get('/:id', );
// router.put('/:id', );
// router.delete('/:id', );

module.exports = router;
