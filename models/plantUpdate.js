
const mongoose = require('mongoose');

const plantUpdateSchema = new mongoose.Schema({
    plantImage: { 
        type: String,
        },
    temperature: { 
        type: String,
        },
    rain: { 
        type: Boolean,
        },
    health: { 
        type: String,
        },
    fertilizer: { 
        type: String,
        },
    notes: { 
        type: String, 
        },
    plant:{
        type: mongoose.Types.ObjectId, 
        ref: 'Plant'
    },

}, {timestamps: true});

module.exports = mongoose.model('PlantUpdate', plantUpdateSchema);