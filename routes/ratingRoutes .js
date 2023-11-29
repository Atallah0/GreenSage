const express = require('express');
const router = express.Router();

const {
    createRating,
} = require('../controllers/ratingController')

router.post('/', createRating);
// router.get('/', );
// router.get('/:id', );
// router.put('/:id', );
// router.delete('/:id', );

module.exports = router;
