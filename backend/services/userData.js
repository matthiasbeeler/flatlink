const validator = require('validator')
const bcrypt = require('bcrypt');
const { generateAccessToken } = require('./global');
const jwt = require('jsonwebtoken');


exports.accountData = async (request, response, User,searcherPreferences,providerPreferences) =>{
     const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;
     var user = await User.findOne({
        attributes: ['firstName', 'lastName', 'phonenumber', 'email', 'userType'],
        where: {
            id: userId
        }
      })
      var personalData;
      if(user.userType == "searcher"){
        personalData = await searcherPreferences.findOne({
            attributes: ['gender', 'occupation'],
            where: {
                id: userId
            }
          })
      }
      if(user.userType == "provider"){
        personalData = await providerPreferences.findOne({
            attributes: ['street', 'place', 'plz', 'flatmates'],
            where: {
                id: userId
            }
          })
      }
     
    if(!user) return response.json({success: false, message: "User not found"});
    const accessToken = await generateAccessToken(userId);
    response.json({userId, token: accessToken, userData: user, userType: user.userType, success: true, personalData: personalData})
}