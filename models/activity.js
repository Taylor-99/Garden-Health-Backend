
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    activity: { 
        type: String, 
    },
    duration: { 
        type: Number, 
    },
    outdoors: { 
        type: Boolean, 
    },
    activity_mood: { 
        type: String, 
    },
    user:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },

}, {timestamps: true});

module.exports = mongoose.model('Activity', moodSchema);