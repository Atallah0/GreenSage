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
});

module.exports = mongoose.model('User', UserSchema);
