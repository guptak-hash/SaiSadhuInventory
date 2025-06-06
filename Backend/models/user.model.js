const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'manager', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    // select: false
  },
  address: {
    type: String,
    // required: [true, 'Please add an address'],
  },
  phone: {
    type: String,
    // required: [true, 'Please add a phone number']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const UserModel=mongoose.model('user',UserSchema)

module.exports = UserModel