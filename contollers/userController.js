
// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const router = require('express').Router();
const db  = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/VerifyJWT');

// Signup route for user registration
router.post('/signup', async (req, res, next) => {
    try {
        let newUser = req.body;

        // Check if the username already exists
        const existingUser = await db.User.findOne({ username: newUser.username});

        if (existingUser) {
            console.log('in back')
            return res.status(400).json({ message: "Username already exists" });
        };

        // Hash the password before saving the user
        newUser.password  = bcrypt.hashSync(newUser.password, bcrypt.genSaltSync(10));
    
        const createUser = new db.User(newUser);
        await createUser.save();

        // Create a token for the new user
        const token = createToken(createUser._id)
        let username = createUser.username

        console.log(token)

        res.cookie("token", token, {
            withCredentials: true,
            httpOnly: false,
        })

        res.status(201).json({ message: "User signed up successfully", success: true, token, username });

        next();

    } catch (error) {
        console.error(error);
    }
});

// Login route for user authentication
router.post('/login', async (req, res, next) => {
    try {
        const userLogin = req.body;

        // Check if both username and password are provided
        if(!userLogin.username || !userLogin.password ){
            return res.json({message:'All fields are required'});

        }

        const user = await db.User.findOne({username: userLogin.username});

            // Check if user exists in the database
        if(!user) {
            // console.log(`Could not find this user in the database: User with username ${userLogin.username}`);
            return res.status(400).json({ message: `Could not find ${userLogin.username} in the database` });
        }

        // Compare provided password with stored hash
        const auth = await bcrypt.compare(userLogin.password, user.password);

        if (!auth) {
            return res.status(400).json({ message: `The password did not match the for the user: ${user.username}` });
        }else {
            // make a token
            const token = createToken(user._id)
            let username = user.username

            console.log("token from login route = ", token)

            res.cookie("token", token, {
                httpOnly: true,
                withCredentials: true,
            })
            res
            .status(201)
            .json({ message: "User signed in successfully", success: true, token, username });

            next();
        }

    } catch (error) {
        console.log('backend')
        console.error(error);
    }
});

// Route for token verification
router.get('/', async (req, res) => {
    const token = req.cookies.token

    if (!token) {
        return res.json({ status: false })
    }

    jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
        if (err) {
            return res.json({ status: false })
        } else {
            const user = await db.User.findById(data.id)

            if (user) return res.json({ status: true, user: user.username })
            else return res.json({ status: false })
        }
  })
})

// Logout route to clear the authentication token
router.get('/logout', verifyToken, (req, res) => {
    console.log('logging out')
    res.clearCookie("token");
    res.clearCookie("user");
    res.json({ message: "Logged out" });
});

// Function to create JWT token
function createToken(userID){
    return jwt.sign(
        { userID }, 
        process.env.SECRET, 
        { expiresIn: '24h'} // Token expiration time set to 24 hours
    );
 };
 
 // https://www.freecodecamp.org/news/how-to-secure-your-mern-stack-application/

 // Export the router to be used in other parts of the application
module.exports = router