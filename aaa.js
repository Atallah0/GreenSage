const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    validate: {
      validator: value => /^[a-zA-Z]+$/.test(value),
      message: 'First name must only contain letters',
    },
    set: value => value.toLowerCase(),
  },
});

const addressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
    validate: {
      validator: value => /^[a-zA-Z0-9]+$/.test(value),
      message: 'Postal code must only contain letters and numbers',
    },
  },
  state: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const User = mongoose.model('User', userSchema);
const Address = mongoose.model('Address', addressSchema);

module.exports = { User, Address };
