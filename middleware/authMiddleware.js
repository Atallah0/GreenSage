const { createCustomError } = require('../utils/customError');

const isOwner = (req, res, next) => {
    // Check if the user has the 'admin' role.
    if (req.user && req.user.role === 'owner') {
        return next();
    }
    return next(createCustomError('Access denied. You are not an owner.', 403));
};

const isCustomer = (req, res, next) => {
    // Check if the user has the 'customer' role.
    if (req.user && req.user.role === 'customer') {
        return next();
    }
    return next(createCustomError('Access denied. You are not an customer.', 403));
};

const hasAccessToOwnData = (req, res, next) => {
    // Check if the user is trying to access their own data.
    if ((req.params || req.body) && req.user && (req.params.id || req.body.userId) === req.user.id) {
        return next();
    }
    return next(createCustomError('Access denied. You do not have permission to access this data.', 403));
};

module.exports = { isOwner, isCustomer, hasAccessToOwnData };
