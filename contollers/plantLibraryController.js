
// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');

const verifyToken = require('../middleware/VerifyJWT');

// Function to fetch a list of plants from an external API
async function fetchPlantList(pageNum) {

    // Make an API request to fetch plant data based on the provided page number
    const plantAPIResponse = await fetch(`https://trefle.io/api/v1/plants?token=${process.env.Plant_API}&page=${pageNum}`);

    // Check if the API request was successful
    if (!plantAPIResponse.ok) {
        throw new Error(`API request failed: ${plantAPIResponse.statusText}`);
    };

    // Parse the JSON response
    const plantData = await plantAPIResponse.json();

    // Check if plant data exists and is not empty
    if (!plantData.data || plantData.length === 0) {
        throw new Error('No plant data found');
    };

    // Return the fetched plant data
    return plantData;
};

// Show list of plants
router.get('/getplants/:pageNum', verifyToken, async (req, res) =>{

    try{

        // Fetch plant data based on the page number
        const plantData = await fetchPlantList(req.params.pageNum);

        // Send the fetched plant data as JSON response
        res.json(plantData);

    }catch (error) {
        console.error("Error fetching data from API:", error);
        throw error;
      }
});

// Show list of plants
router.get('/getfavorites', verifyToken, async (req, res) =>{

    try{
        const findUserProfile = await db.UserProfile.find({ user: req.user._id})

        const userFavorites = findUserProfile[0].favorite_plants

        // Send the fetched plant data as JSON response
        res.json(userFavorites);

    }catch (error) {
        console.error("Error fetching data from API:", error);
        throw error;
      }
});

// Function to fetch details of a specific plant using its scientific name
async function fetchPlantDetails(sName) {

    const encodedsName = sName.split(' ').join('%20');

    // Make an API request to fetch plant details based on the provided scientific name
    const plantAPIResponse = await fetch(`https://trefle.io/api/v1/plants?token=${process.env.Plant_API}&filter[scientific_name]=${sName}`);

    // Check if the API request was successful
    if (!plantAPIResponse.ok) {
        throw new Error(`API request failed: ${plantAPIResponse.statusText}`);
    };

    // Parse the JSON response
    const plantData = await plantAPIResponse.json();

    // Check if plant data exists and is not empty
    if (!plantData.data || plantData.length === 0) {
        throw new Error('No plant data found');
    };

    // Return the fetched plant data
    return plantData;
};

// Show details of a specific plant by its scientific name
router.get('/details/:sName', verifyToken, async (req, res) =>{

    try{

        // Fetch plant details based on the provided scientific name
        const plantDetails = await fetchPlantDetails(req.params.sName);

        // Send the fetched plant details as JSON response
        res.json(plantDetails);

    }catch (error) {
        // Log error and throw it up the chain
        console.error("Error fetching data from API:", error);
        throw error;
      }
});

// Function to fetch plant search results based on a search term and page number
async function fetchPlantSearch(searchTerm) {

    const encodedSearchTerm = searchTerm.split(' ').join('%20');

    // Make an API request to search for plants based on the provided search term and page number
    const plantAPIResponse = await fetch(`https://trefle.io/api/v1/plants/search?token=${process.env.Plant_API}&q=${encodedSearchTerm}`);

    // Check if the API request was successful
    if (!plantAPIResponse.ok) {
        throw new Error(`API request failed: ${plantAPIResponse.statusText}`);
    };

    // Parse the JSON response
    const plantData = await plantAPIResponse.json();

    // Check if plant data exists and is not empty
    if (!plantData.data || plantData.length === 0) {
        throw new Error('No plant data found');
    };

    // Return the fetched plant data
    return plantData;
};

// Show plants based on a search term
router.get('/search/:searchTerm', verifyToken, async (req, res) =>{

    try{

        // Fetch plant search results based on the search term and page number
        const plantSearch = await fetchPlantSearch(req.params.searchTerm);

        // Send the fetched plant search results as JSON response
        res.json(plantSearch);

    }catch (error) {
        // Log error and throw it up the chain
        console.error("Error fetching data from API:", error);
        throw error;
      }
});

// Update user's favorites
router.put('/favorites/:sName', verifyToken, async (req, res) => {

    try{
        // Find the user's profile based on their user ID
        const userProfile = await db.UserProfile.findOne({ user: req.user._id });

        // If user profile not found, return 404 error
        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found" });
        }

        // Initialize favorite_plants array if not exists in user profile
        if (!userProfile.favorite_plants) {
            userProfile.favorite_plants = [];
        }

        // Check if the plant is already in the favorites
        if (!userProfile.favorite_plants.includes(req.params.sName)) {
            // Add the plant to the favorites
            userProfile.favorite_plants.push(req.params.sName);

            await userProfile.save(); // Save the updated user profile
        }

        // Send the updated user profile as response
        res.send(userProfile.favorite_plants)

    }catch (error) {
        console.error("Error adding to favorite plants:", error);
        res.status(500).json({ message: "Internal server error" });
    }

});

// Delete a plant from user's favorites
router.delete('/favorites/:sName', verifyToken, async (req, res) => {
    try {
        // Find the user's profile based on their user ID
        const userProfile = await db.UserProfile.findOne({ user: req.user._id });

        // If user profile not found, return 404 error
        if (!userProfile) {
            return res.status(404).json({ message: "User profile not found" });
        }

        // Initialize favorite_plants array if not exists in user profile
        if (!userProfile.favorite_plants) {
            userProfile.favorite_plants = [];
        }

        // Remove the plant from the favorites
        userProfile.favorite_plants = userProfile.favorite_plants.filter(
            (plant) => plant !== req.params.sName
        );

        await userProfile.save(); // Save the updated user profile

        // Send the updated user profile as response
        res.json(userProfile.favorite_plants);

    } catch (error) {
        console.error("Error removing from favorite plants:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


module.exports = router