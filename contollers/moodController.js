
// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');

const verifyToken = require('../middleware/VerifyJWT');

// Show - Mood
router.get('/', verifyToken, async (req, res) => {

    try {
        // Retrieve all mood entries for the authenticated user
        const userMoods = await db.Mood.find({ user: req.user._id})

        // Send the retrieved mood entries as response
        res.json(userMoods)
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

// Show - Jounal Entry
router.get('/:moodId', verifyToken, async (req, res) => {

    try {
        // Retrieve journal entries associated with the specified mood ID for the authenticated user
        const userJournalEntry = await db.Journal.find({ mood: req.user.moodId})

        // Send the retrieved journal entries as response
        res.send(userJournalEntry)
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

// Delete - Mood and Journal Entry
router.delete('/:moodId', async (req, res) =>{

    try{
        // Delete the mood entry by its ID
        const deletedMood = await db.Mood.findByIdAndDelete( req.params.moodId );

        // If the mood entry doesn't exist, return a 404 status code
        if (!deletedMood) {
            return res.status(404).json({ message: 'Mood not found' });
        }

        // Delete the journal entry associated with the deleted mood
        await db.Journal.findOneAndDelete( { mood: req.params.moodId });

        // Send a success message with a 200 status code
        res.status(200).json({ message: 'Mood and associated journal entry deleted successfully' });

    } catch (error) {
        console.error("Error deleting mood and journal entry:", error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update - Mood log and Journal
router.put('/:moodid', async (req, res) => {

    try{

        // Find the existing mood
        const pastMood = await db.Mood.findById(moodId);

        // Return a 404 status code if the mood doesn't exist
        if (!pastMood) {
            return res.status(404).json({ message: "Mood not found" });
        }

        // Retrieve the past journal status
        let pastJournal = pastMood.journal

        // Update the mood log with the provided data
        await db.Mood.findByIdAndUpdate(req.params.moodid, 
            {
                overallMood: req.body.overallMood,
                energyLevel: req.body.energyLevel,
                stressLevel: req.body.stressLevel
            }
        );

        // Handle journal entry updates based on changes in journal status
        if(req.body.journal === false && pastJournal === true){
            // Delete the associated journal entry if the journal status changes to false
            await db.Journal.findOneAndDelete( { mood: req.params.moodid });
        }
        else if(req.body.journal === true && pastJournal === false){
            // Create a new journal entry if the journal status changes to true
            createJournal(moodid, req.body.journalEntry)
        }else{
            // Update the existing journal entry if the journal status remains the same
            await db.Journal.findOneAndUpdate({ mood: req.params.moodid}, { entry: req.body.journalEntry})
        }

    }catch (error) {
        console.error("Error updating mood:", error.message);
        res.status(400).send(error.message);
    }

});

// Function to create a new mood log
async function createMood(userId, moodData) {

    // Define the new mood object with provided data
    const newMood = {
        overallMood: moodData.overallMood,
        energyLevel: moodData.energyLevel,
        stressLevel: moodData.stressLevel,
        journalEntry: moodData.journalEntry,
        user:userId
    };

    // Create the mood log in the database
    const createdMood = await db.Mood.create(newMood);
    // Save the created mood log
    await createdMood.save();

    // Return the created mood log
    return createdMood;
};

// Function to create a new journal entry
async function createJournal(moodId, journalEntry) {

    // Define the new journal entry object with provided data
    const newEntry = {
        entry: journalEntry,
        mood: moodId
    };

    // Create the journal entry in the database
    const createdEntry = await db.Journal.create(newEntry);
    // Save the created journal entry
    await createdEntry.save();
};

// Create - Mood Log and Journal
router.post('/create', verifyToken, async (req, res) =>{

    try {
        // Find the user by their ID
        const user = await db.User.findById(req.user._id);

        // Return a 404 status code if the user doesn't exist
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        // Create a new mood log with the provided data
        const mood = await createMood(req.user._id, req.body);

        // Check if the mood log has a journal entry
        if(req.body.entry !== ""){
            console.log("Journal created")
            // Create a journal entry associated with the mood log
            await createJournal(mood._id, req.body.journalEntry);
        }

        // Return a success message
        return res.json({ message:'created Mood' })
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

// edit - Mood log and Journal
router.get('/edit/:moodId', async(req, res) => {

    try {
        // Find the mood log by ID
        const mood = await db.Mood.findById(req.params.moodId);

        // Return a 404 status code if the mood log doesn't exist
        if (!mood) {
        return res.status(404).json({ message: "Mood not found" });
        }

        // Find the journal entry associated with the mood log
        const journalEntry = await db.Journal.find({mood: req.params.moodId});

        // Combine mood log and journal entry for editing
        let editMoodLog = [
            mood,
            journalEntry
        ];

        // Return the combined data
        res.json(editMoodLog);
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

module.exports = router