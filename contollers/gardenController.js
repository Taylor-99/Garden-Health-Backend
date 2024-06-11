
// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');
const verifyToken = require('../middleware/VerifyJWT');
const upload = require('../middleware/uploadImage');

// Delete route for deleting a plant by its ID
router.delete('/:plantId', verifyToken, async (req, res) =>{
    try{
        // Find and delete the plant from the database using its ID
        await db.Plant.findByIdAndDelete( req.params.plantId );

        // Remove all plant updates associated with the deleted plant
        await db.PlantUpdate.remove({ plant: req.params.plantId });
        
        // Send a success response
        res.status(200).json({ message: 'Plant deleted successfully' });
    }catch (error) {
        // Log any errors and send an error response
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Route for marking a plant as watered
router.put('/water/:plantID', verifyToken, async (req, res) =>{

    try {
        // Find the plant in the database by its ID
        const plant = await db.Plant.findById(req.params.plantID);

        // Check if the plant exists
        if (!plant) {
            return res.status(404).send("Plant not found");
        }

        // Mark the plant as watered
        plant.watered = true;
        plant.lastWatered = new Date();

        // Save the updated plant in the database
        await plant.save(); 

        // Send a success response
        res.status(200).json({ message: 'Plant successfully marked as watered' });
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

// Function to create a new plant
async function createNewPlant(userId, plantData) {

    if(plantData.watered.toLowerCase() === 'yes'){
        plantData.watered = true
    } else{
        plantData.watered = false
    }

    // Define the properties of the new plant
    const newPlant = {
        plantName: plantData.plantName,
        plantSpecies: plantData.plantSpecies,
        watered: plantData.watered,
        lastWatered: new Date(),
        plantDate: plantData.plantDate,
        user: userId
    };

    // Create the new plant in the database
    const createdPlant = await db.Plant.create(newPlant);
    await createdPlant.save();

    // Return the ID of the created plant
    return createdPlant._id;
};

// Function to create a new plant update
async function createNewPlantUpdate(plantId, updateData, plantPic) {

    if(updateData.rain.toLowerCase() === 'yes'){
        updateData.rain = true
    } else{
        updateData.rain = false
    }

    // console.log(updateData.plantImage)

    // Define the properties of the new plant update
    const newPlantUpdate = {
        plantImage: plantPic,
        temperature: updateData.temperature,
        rain: updateData.rain,
        health: updateData.health,
        fertilizer: updateData.fertilizer,
        notes: updateData.notes,
        plant: plantId,
    };

    // Create the new plant update in the database
    const createdUpdate = await db.PlantUpdate.create(newPlantUpdate);
    await createdUpdate.save();
}

// Route to create a new plant
router.post('/create',verifyToken, upload.single("plantImage"), async (req, res) =>{

    try {

        // Find the authenticated user
        const user = await db.User.findById(req.user._id);

        // Check if the user exists
        if (!user) {
        return res.status(404).json({ message: "User not found" });
        }

        // Create a new plant and get its ID
        const plantId = await createNewPlant(req.user._id, req.body);


        let plantImage = `../uploads/${req.file.fieldname}`

        // Create a new plant update for the created plant
        await createNewPlantUpdate(plantId, req.body, plantImage);

        // // Send a success response
        return res.json({ message:'created plant' })
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

//Create route to update a plant
router.post('/update/:plantId', verifyToken, async (req, res) =>{

    try {
        // Create a new plant update for the specified plant
        await createNewPlantUpdate(req.params.plantId, req.body);

        // Send a success response
        return res.json({ message:'plant updated' })
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

// Show all plants and their latest updates
router.get('/', verifyToken, async (req, res) =>{

    try {
        // Find all plants belonging to the authenticated user
        const userPlants = await db.Plant.find({ user: req.user._id});

        const today = new Date();

        // Initialize an empty array to store plant details with their latest updates
        let updateList = [];

        // Iterate through each user plant
        for(const plant of userPlants){

            const isSameDay = 
                plant.lastWatered &&
                plant.lastWatered.getDate() === today.getDate() &&
                plant.lastWatered.getMonth() === today.getMonth() &&
                plant.lastWatered.getFullYear() === today.getFullYear()

            if(!isSameDay){
                plant.watered = false;
                plant.save()
            }
            
            // Find all updates for the current plant, sorted by createdAt date in descending order
            const userPlantUpdates = await db.PlantUpdate.find({ plant: plant._id}).sort({ createdAt: -1 });

            // Get the latest update for the current plant, or null if no updates exist
            let lastUpdate = userPlantUpdates.length > 0 ? userPlantUpdates[0] : null;

            // Push the plant and its latest update (if any) to the updateList array
            updateList.push([
                plant,
                lastUpdate
            ]);
        };

        // Send the updateList as JSON response
        res.json(updateList);

    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

// Show details of a specific plant and its updates
router.get('/details/:plantID', verifyToken, async (req, res) =>{

    try {
        // Find the plant by its ID
        const plant = await db.Plant.findById(req.params.plantID)

        // Find all updates for the specified plant
        const plantUpdates = await db.PlantUpdate.find({ plant: req.params.plantID});

        // Combine plant and update details into an array
        let plantDetails = [
            plant,
            plantUpdates
        ];

        // Send the plantDetails as JSON response
        res.json(plantDetails)
        
    } catch (error) {
        console.error(error.message);
        res.status(400).send(error.message);
    }

});

module.exports = router