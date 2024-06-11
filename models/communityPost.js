
const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    post: { 
        type: String, 
    },
    image: { 
        type: String, 
    },
    likes: { 
        type: Array, 
    },
    userImage: {
        type: String
    },
    userName: {
        type: String
    },
    user:{
        type: mongoose.Types.ObjectId, 
        ref: 'User'
    },

}, {timestamps: true});

module.exports = mongoose.model('CommunityPost', communityPostSchema);