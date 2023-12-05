const passport = require('passport');
const passportJWT = require('passport-jwt');
const { ExtractJwt } = require('passport-jwt');
require('dotenv').config({ path: '../../.env' });
const User = require('../../models/userModel');

const StrategyJWT = passportJWT.Strategy;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
};

passport.use(new StrategyJWT(jwtOptions, async (jwtPayload, done) => {
    try {
        const user = await User.findById(jwtPayload.id);

        if (user) {
            const updatedPayload = { ...jwtPayload, role: user.role };
            return done(null, updatedPayload);
        } else {
            return done(null, false);
        }
    } catch (error) {
        return done(error, false);
    }
}));

module.exports = passport;
