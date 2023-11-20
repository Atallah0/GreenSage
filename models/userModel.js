const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name can not be empty'],
        trim: true,
        maxLength: [30, 'Name can not be longer than 30 characters']
    },
    email: {
        type: String,
        required: [true, 'Email can not be empty'],
        trim: true,
        unique: [true, 'Email already exists']
    }
    // age: {
    //     type: Number,
    //     default: 0,
    //     min: [0, 'Age can not be in minus'],
    //     max: [120, 'Age can not be more than 120 years'],
    // }
});

module.exports = mongoose.model('User', UserSchema);
