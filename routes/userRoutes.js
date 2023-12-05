const express = require('express');
const router = express.Router();

const { isOwner, isCustomer, hasAccessToOwnData } = require('../middleware/authMiddleware');
const passport = require('passport');
require('../utils/auth/passport');

const {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
} = require('../controllers/userController')

router.post('/', createUser);
router.get('/', /*passport.authenticate('jwt', { session: false }), isOwner,*/ getUsers);
router.get('/:id', /*passport.authenticate('jwt', { session: false }), isCustomer, hasAccessToOwnData,*/ getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;