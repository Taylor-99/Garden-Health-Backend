
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
    challengeNumber: {
        type: Number,
    },
    difficulty: { 
        type: String,
    },
        description: { 
        type: String,
    },
    count: {
        type: Number,
    },
    completed: {
        type: Boolean,
    },
    user:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },

}, {timestamps: true});

module.exports = mongoose.model('Challenge', challengeSchema);