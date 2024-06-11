
const mongoose = require('mongoose');

const postCommentSchema = new mongoose.Schema({
    reply: { 
        type: String, 
    },
    image: { 
        type: String, 
    },
    userImage: {
        type: String
    },
    userName: {
        type: String
    },
    post: {
        type: mongoose.Types.ObjectId, 
        ref: 'CommunityPost'
    },
    user:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },

}, {timestamps: true});

module.exports = mongoose.model('PostComment', postCommentSchema);