const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name can not be empty'],
        trim: true,
        maxLength: [30, 'Name can not be longer than 30 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name can not be empty'],
        trim: true,
        maxLength: [30, 'Name can not be longer than 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email can not be empty'],
        trim: true,
        unique: [true, 'Email already exists'],
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Invalid email format',
        },
    },
    mobile: {
        type: String,
        required: true,
    },
    // dateOfBirth: {
    //     type: Date,
    // },
    // password: {
    //     type: String,
    //     required: true,
    // },
    // imageUrl: {
    //     type: String,
    //     required: true,
    // },
    // role: {
    //     type: String,
    //     required: true,
    //     default: 'admin',
    // },
    addresses: [
        {
            street: {
                type: String,
                required: true,
            },
            postalCode: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
        },
    ],
    fullName: {
        type: String,
        virtual: true,
        get: function () {
            return `${this.firstName} ${this.lastName}`;
        },
    },
});

module.exports = mongoose.model('User', userSchema);
