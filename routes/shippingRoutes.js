const express = require('express');
const router = express.Router();

const {
    createShipping,
    getShipments,
    getShipment
} = require('../controllers/shippingController')

router.post('/', createShipping);
router.get('/', getShipments);
router.get('/:id', getShipment);

module.exports = router;
