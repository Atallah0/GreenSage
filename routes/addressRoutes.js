const express = require('express');
const router = express.Router();

const {
    addAddress,
    getAddresses,
    getAddress,
    updateAddress,
    deleteAddress,
    deleteAllAddresses
} = require('../controllers/addressController')

router.post('/:id', addAddress);
router.get('/:id', getAddresses);
router.get('/:userId/address/:addressId', getAddress);
router.put('/:userId/address/:addressId', updateAddress);
router.delete('/:userId/address/:addressId', deleteAddress);
router.delete('/:userId', deleteAllAddresses);

module.exports = router;
