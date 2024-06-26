// Require the Mongoose package & your environment configuration
const mongoose = require('mongoose');
require('dotenv').config()

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODBURI);
const db = mongoose.connection
	
db.on('connected', function() {
  console.log(`Connected to MongoDB ${db.name} at ${db.host}:${db.port}`);
});

// Export models to `server.js`
module.exports = {
    User: require('./user'),
    UserProfile: require('./userProfile'),
    Plant: require('./plant'),
    PlantUpdate: require('./plantUpdate'),
    Mood: require('./mood'),
    Journal: require('./journalEntry'),
    Activity: require('./activity'),
    CommunityPost: require('./communityPost'),
    PostComment: require('./postComment'),
    Challenges: require('./challenges'),
    Reminder: require('./reminder'),
  };