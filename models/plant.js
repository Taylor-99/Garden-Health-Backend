
const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema({
    plantName: { 
        type: String, 
        required: true 
        },
    plantSpecies: { 
        type: String,  
        },
    watered: { 
        type: Boolean, 
        },
    lastWatered: {
        type: Date,
    },
    plantDate: { 
        type: Date, 
        },
    user:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },

}, {timestamps: true});

module.exports = mongoose.model('Plant', plantSchema);