// Import required modules
const validator = require('validator')
const bcrypt = require('bcrypt');
const { generateAccessToken } = require('./global');
const jwt = require('jsonwebtoken');

// Function to retrieve account data
exports.accountData = async (request, response, User, searcherPreferences, providerPreferences) => {
    // Verify JWT token and extract user ID
    const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;

    // Fetch basic user data
    var user = await User.findOne({
        attributes: ['firstName', 'lastName', 'phonenumber', 'email', 'userType', 'emailVerified'],
        where: {
            id: userId
        }
    })

    var personalData;

    // Fetch additional data based on user type
    if (user.userType == "searcher") {
        personalData = await searcherPreferences.findOne({
            attributes: ['gender', 'occupation'],
            where: {
                id: userId
            }
        })
    }
    if (user.userType == "provider") {
        personalData = await providerPreferences.findOne({
            attributes: ['street', 'place', 'plz', 'flatmates'],
            where: {
                id: userId
            }
        })
    }

    // Return error if user not found
    if (!user) return response.json({ success: false, message: "User not found" });

    // Generate new access token
    const accessToken = await generateAccessToken(userId, user.userType);

    // Send response with user data and new token
    response.json({ userId, token: accessToken, userData: user, userType: user.userType, success: true, personalData: personalData })
}

// Function to retrieve all user data
exports.allData = async (request, response, User, searcherPreferences, providerPreferences) => {
    // Verify JWT token and extract user ID
    const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;

    // Fetch all user data
    var user = await User.findOne({
        where: {
            id: userId
        }
    })

    var personalData;

    // Fetch additional data based on user type
    if (user.userType == "searcher") {
        personalData = await searcherPreferences.findOne({
            where: {
                id: userId
            }
        })
    }
    if (user.userType == "provider") {
        personalData = await providerPreferences.findOne({
            where: {
                id: userId
            }
        })
    }

    // Return error if user not found
    if (!user) return response.json({ success: false, message: "User not found" });

    // Send response with all user data
    response.json({ userId, userData: user, userType: user.userType, success: true, personalData: personalData })
}