// categoryService.js
const Category = require('../models/categoryModel');

const getCategoryById = async (categoryId) => {
    const category = await Category.findById(categoryId);
    return category;
};

const getCategoryNameById = async (categoryId) => {
    const category = await Category.findById(categoryId);
    return category ? category.name : null;
};

module.exports = { getCategoryNameById };


// const getCategoryById = async (categoryId) => {
//     const category = await Category.findById(categoryId);
//     return category;
// };

// const getCategoryNameById = async (categoryId) => {
//     const category = await getCategoryById(categoryId);
//     return category ? category.name : null;
// };

// module.exports = { getCategoryNameById };