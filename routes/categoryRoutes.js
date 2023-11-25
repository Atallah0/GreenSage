const express = require('express');
const router = express.Router();

const {
    createCategory,
    getCategories,
    getCategory,
} = require('../controllers/categoryController')

router.post('/', createCategory);
router.get('/', getCategories);
router.get('/:id', getCategory);

module.exports = router;