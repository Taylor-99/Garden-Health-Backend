
// Load environment variables from .env file
require('dotenv').config();

// Import required modules and Data
const router = require('express').Router();
const db  = require('../models');
const verifyToken = require('../middleware/VerifyJWT')
const challengesData = require('../data/challenges')
const remindersData = require('../data/reminders')

// Function to fetch location data from OpenWeather API
async function fetchLocationData(city) {
    // Make API request to fetch location data for the given city
    const locationAPIResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.Weather_API}`);

    // Check if the API request was successful
    if (!locationAPIResponse.ok) {
        throw new Error(`API request failed: ${locationAPIResponse.statusText}`);
    };

    // Parse the JSON response
    const locationData = await locationAPIResponse.json();

    // Check if any location data was returned
    if (locationData.length === 0) {
        throw new Error('No location data found');
    }

    // Return the first result from the location data
    return locationData[0];
}

// Function to fetch location data from OpenWeather API
async function fetchWeatherData(lat, lon) {
    // Make API request to fetch weather data for the given latitude and longitude
    const weatherAPIResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.Weather_API}`);

    // Check if the API request was successful
    if (!weatherAPIResponse.ok) {
        throw new Error(`API request failed: ${weatherAPIResponse.statusText}`);
    };

    // Return the parsed JSON response containing weather data
    return weatherAPIResponse.json();
}

// Route to get weather data for the user's city
router.get('/getweather', verifyToken, async (req, res) =>{

    try{

        // Fetch user profile from the database using the user ID from the verified token
        const userProfile = await db.UserProfile.findOne({ user: req.user._id });

        console.log(req.user)
        // Get the user's city from their profile
        let userCity = userProfile.city;

        // Fetch location data (latitude and longitude) for the user's city
        const locationData = await fetchLocationData(userCity);
        const { lat, lon } = locationData;

        // Fetch weather data using the fetched latitude and longitude
        const weatherData = await fetchWeatherData(lat, lon);

        // Send the weather data as the response
        res.json(weatherData);

    }catch (error) {
        // Log error and throw it up the chain
        console.error("Error fetching data from API:", error);
        throw error;
      }
});

// Function to create a new challenge
async function createChallenge (challengeNum, userId){

    // Define the properties of the new challenge
    let newChallenge = {
        challengeNumber: challengeNum,
        difficulty: challengesData[challengeNum].difficulty,
        description: challengesData[challengeNum].description,
        count: 0,
        completed: false,
        user: userId,
    }

    // Create the challenge in the database
    let createdChallenge = await db.Challenges.create(newChallenge);

    // Save the created challenge
    await createdChallenge.save();

    // Return the created challenge
    return createdChallenge;
};

// Function to get or create a challenge for the user
async function getOrCreateChallenge(userId) {

    // Find all challenges associated with the user
    const userChallenges = await db.Challenges.find({ user: userId});

    // If the user has no challenges, create the first one
    if(userChallenges.length === 0){
        const firstChallenge = createChallenge(0, userId)
        console.log('first challenge created')
        return (firstChallenge)
    }else {

        let needsNewChallenge = true;
        let today = new Date()
        let lastChallenge = userChallenges[userChallenges.length - 1]
    
        // Check if the last challenge was created or updated on the same day
        const isSameDay = 
        (lastChallenge.createdAt.getDate() === today.getDate() &&
        lastChallenge.createdAt.getMonth() === today.getMonth() &&
        lastChallenge.createdAt.getFullYear() === today.getFullYear()) || 
        (lastChallenge.updatedAt.getDate() === today.getDate() &&
        lastChallenge.updatedAt.getMonth() === today.getMonth() &&
        lastChallenge.updatedAt.getFullYear() === today.getFullYear());
    
        // Iterate through user challenges to determine if a new challenge is needed
        for(let c=0; c < userChallenges.length; c++){
    
            if (!userChallenges[c].completed) {
                needsNewChallenge = false;
                console.log('need to complete challenge');
                return(userChallenges[c]);
            }
            else if(needsNewChallenge === true && !isSameDay) {
                // If a new challenge is needed and it's a new day, create it
                let newChallenge = await createChallenge(userChallenges.length, userId);
                console.log("new challenge for today");
                return(newChallenge);
            }else{
                // If no new challenge is needed or it's the same day, return a message
                return(userChallenges[userChallenges.length - 1])
            }
        }
    }
    
};

// Route to get and create a challenge for the user
router.get('/challenge', verifyToken, async (req, res) =>{

    try {
        // Get or create a challenge for the user
        const challenge = await getOrCreateChallenge(req.user._id);
        res.json(challenge);
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

//Update challenge
router.put('/challenge/update/:challengeId', verifyToken, async (req, res) => {
    try{
        // find the challenge using its ID
        let updateChallenge = await db.Challenges.findById(req.params.challengeId);

        if (!updateChallenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        updateChallenge.completed = true;
        await updateChallenge.save()

        // Send a success response
        res.status(200).json({ message: 'Challenge updated successfully', challenge: updateChallenge });

    } catch (error) {
        console.error("Error updating challenge: ", error.message);
        res.status(400).json({ message: error.message });
    }
});

// Function to create a new reminder
async function createReminder(reminder, userId){

    // Define the properties of the new reminder
    let newReminder = {
        message: reminder.message,
        model: reminder.model,
        repeat: reminder.repeat,
        completed: false,
        user: userId,
    }

    // Create the reminder in the database
    let createdReminder = await db.Reminder.create(newReminder);

    // Save the created reminder
    await createdReminder.save();

}

// Function to check for and create reminders for the user
async function checkForReminders(userID){

    // Retrieve all reminders and plants associated with the user
    let getReminders = await db.Reminder.find({ user: userID})
    console.log(getReminders)
    let plants = await db.Plant.find({ user: userID})

    // If the user has no reminders, create reminders based on predefined data
    if( getReminders.length === 0){
        for(let r = 0; r < remindersData.length; r++){
            if(remindersData[r].model !== "Plant"){
                createReminder(remindersData[r], userID)
            }
        }

        // Return all reminders for the user
        return await db.Reminder.find({ user: userID})

    }
    // If the user has plants, create reminders specific to plants
    else if(plants.length !== 0){
        for(let m = 0; m < remindersData.length; m++){
            if(remindersData[m].model === "Plant"){
                // Check if a reminder for plant model already exists
                const existingPlantReminder = await db.Reminder.findOne({
                    user: userID,
                    message: remindersData[m].message
                });
                
                // If reminder doesn't exist, create it
                if (!existingPlantReminder) {
                    createReminder(remindersData[m], userID);
                };
            };
        };

        // Return all reminders for the user
        return await db.Reminder.find({ user: userID})

    }
    // If the user has reminders, return only the incomplete ones
    else{
        return getReminders.filter(reminder => !reminder.completed);
    }
};

// Route to get reminders for the user
router.get('/reminders', verifyToken, async (req, res) =>{

    try {
        
        // Retrieve and send reminders for the authenticated user
        const reminders = await checkForReminders(req.user._id)
        res.json(reminders)
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

//Update reminder
router.put('/reminders/update/:reminderId', verifyToken, async (req, res) => {
    try{
        // find the challenge using its ID
        let updateReminder = await db.Reminder.findById(req.params.reminderId);

        if (!updateReminder) {
            return res.status(404).json({ message: 'Reminder not found' });
        }

        updateReminder.completed = true;
        await updateReminder.save()

        // Send a success response
        res.status(200).json({ message: 'Reminder updated successfully', reminder: updateReminder });

    } catch (error) {
        console.error("Error updating reminders: ", error.message);
        res.status(400).json({ message: error.message });
    }

});

module.exports = router