
const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    message: {
        type: String,
    },
    model: { 
        type: String,
    },
    repeat: {
        type: String,
    },
    completed: {
        type: Boolean,
    },
    user:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },

}, {timestamps: true});

module.exports = mongoose.model('Reminder', reminderSchema);