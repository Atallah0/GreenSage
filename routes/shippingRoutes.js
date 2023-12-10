const express = require('express');
const router = express.Router();

const {
    createShipping,
    getShipments
} = require('../controllers/shippingController')

router.post('/:userId', createShipping);
router.get('/:userId', getShipments);
// router.get('/:id', getRating);
// router.put('/:id', updateRating);
// router.delete('/:id', deleteRating);

module.exports = router;
