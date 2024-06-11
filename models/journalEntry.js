
const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
    entry: { 
        type: String, 
    },
    mood:{
        type: mongoose.Types.ObjectId, 
        ref: 'Mood'
    },

}, {timestamps: true});

module.exports = mongoose.model('Journal', journalSchema);