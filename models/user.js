
const mongoose = require('mongoose');

const userLoginSchema = new mongoose.Schema({
  username: { 
    type: String, 
    unique: true, 
    required: true 
    },
  password: { 
    type: String, 
    required: true
    },

}, {timestamps: true});

module.exports = mongoose.model('User', userLoginSchema);