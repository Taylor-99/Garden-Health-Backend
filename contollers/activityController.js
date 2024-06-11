
// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');

const verifyToken = require('../middleware/VerifyJWT');

// Show
router.get('/', verifyToken, async (req, res) => {

    try {
        // Find user activity based on the user ID
        const userActivity = await db.Activity.find({ user: req.user._id})

        // Send the user activity data
        res.send(userActivity)
        
    } catch (error) {
        console.error("Error getting Activity:", error.message);
        res.status(500).json({ message: 'Internal server error' });
    }

});

// Delete 
router.delete('/:activeId', async (req, res) =>{
    try{
        // Delete the activity using its ID
        const deletedActivity = await db.Activity.findByIdAndDelete( req.params.activeId );

        // If activity doesn't exist, return 404 status with a message
        if (!deletedActivity) {
            return res.status(404).json({ message: 'Activity not found' });
        }

        // Send a success message if activity is deleted
        res.status(200).json({ message: 'Activity deleted successfully' });

    }catch (error) {
        console.error("Error deleting activity:", error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update
router.put('/:activityId', async (req, res) => {

    try{
        // Update the activity using its ID and the data from the request body
        await db.Activity.findByIdAndUpdate(
            req.params.activityId, 
            req.body,
        );

    }catch (error) {
        console.error("Error updating activity:", error.message);
        res.status(400).json({ message: error.message });
    }

});

// Function to create a new activity
async function createActivity(userId, activityData) {


    let booleanActivity = false

        if(activityData.outdoors.toLowerCase() === 'yes'){
            booleanActivity = true
        }

    // Define the new activity object with provided data
    const newActivity = {
        activity: activityData.activity,
        duration: activityData.duration,
        outdoors: booleanActivity,
        activity_mood: activityData.activity_Mood,
        user: userId,
    };

    // Create the activity in the database
    const createdActivity = await db.Activity.create(newActivity);
    await createdActivity.save(); // Save the created activity
};

// Create 
router.post('/create', verifyToken, async (req, res) =>{

    try {
        // Find the user by their ID
        const user = await db.User.findById(req.user._id);

        // Return 404 status with a message if user is not found
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        // Call the createActivity function to create a new activity
        await createActivity(req.user._id, req.body);

        // Return a success message with 201 status
        return res.status(201).json({ message: 'Activity created successfully'});
        
    } catch (error) {
        console.error("Error creating activity:", error.message);
        res.status(400).json({ message: error.message });
    }

});

// Edit
router.get('/edit/:activityId', async(req, res) => {

    try {
        // Find the activity by its ID
        const activity = await db.Activity.findById(req.params.activityId);

        // Return 404 status with a message if activity is not found
        if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
        }

        // Return the activity details
        res.json(activity);
        
    } catch (error) {
        console.error("Error fetching activity:", error.message);
        res.status(400).json({ message: error.message });
    }

});

module.exports = router