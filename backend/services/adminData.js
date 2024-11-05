const jwt = require("jsonwebtoken");
const { formatPhonenumber } = require("./global");
const { Op, where } = require("sequelize");

const sequelize = require('sequelize');

exports.getStartStats = async (request, response, User, matchLog) =>{
  //serving adminPage with counts of matches, likes, dislikes, searchers and providers
    const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;

    const searcherCount = await User.count({
        where: { userType: 'searcher' }
      });
  
      const providerCount = await User.count({
        where: { userType: 'provider' }
      });
      const matchCount = await matchLog.count();
      const likesCount = await matchLog.count({
        where: { matchType: true }
      });
      const dislikesCount = await matchLog.count({
        where: { matchType: false }
      });
    
   response.json({searcherCount, providerCount, dislikesCount, likesCount, matchCount, success: true})
  }


  exports.filterUserAccounts = async (request, response, User, matchLog) =>{
    //serving adminPage with counts of matches, likes, dislikes, searchers and providers
      const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;
      var phonenumber = "";
       if(request.body.phonenumber) phonenumber = await formatPhonenumber(request.body.phoneCode + request.body.phonenumber);

       let whereClause = {
        firstName: { [Op.like]: `%${request.body.firstName || ''}%` },
        lastName: { [Op.like]: `%${request.body.lastName || ''}%` },
        email: { [Op.like]: `%${request.body.email || ''}%` },
        phonenumber: { [Op.like]: `%${request.body.phonenumber || ''}%` },
        userType: { [Op.like]: `%${request.body.userType || ''}%` }
      };
  

      const userList = await User.findAll({
        where: whereClause
      });
     
      
     response.json({userList, success: true})
    }
  
  

    exports.getUserData = async (request, response, User, matchLog, searcherPreferences, providerPreferences) => {
      try {
          const userData = await User.findOne({
              where: {
                  id: request.body.id
              }
          });
  
          if (!userData) {
              return response.json({ success: false, error: 'User not found' });
          }
  
          let matchLogs;
          let preferences;
  
          if (request.body.userType === "searcher") {
              [preferences, matchLogs] = await Promise.all([
                  searcherPreferences.findOne({
                      where: { id: request.body.id }
                  }),
                  matchLog.findAll({
                      where: { searcherId: request.body.id },
                      include: [{
                          model: providerPreferences,
                          attributes: ['street', 'place', 'plz', 'images']
                      }],
                      order: [['createdAt', 'DESC']]
                  })
              ]);
  
              return response.json({
                  success: true,
                  userData,
                  searcher: preferences,
                  matchLogs
              });
          }
  
          if (request.body.userType === "provider") {
              [preferences, matchLogs] = await Promise.all([
                  providerPreferences.findOne({
                      where: { id: request.body.id }
                  }),
                  matchLog.findAll({
                      where: { providerId: request.body.id },
                      include: [{
                          model: User,
                          attributes: ['firstName', 'lastName']
                      }],
                      order: [['createdAt', 'DESC']]
                  })
              ]);
  
              return response.json({
                  success: true,
                  userData,
                  provider: preferences,
                  matchLogs
              });
          }
  
          return response.json({ 
              success: false, 
              error: 'Invalid user type' 
          });
      } catch (error) {
          console.error('Error in getUserData:', error);
          return response.json({ 
              success: false, 
              error: 'Server error' 
          });
      }
  };
    
    exports.updateUserData = async (request, response, User, searcherPreferences, providerPreferences) => {
      const { id, userType, userData, preferences } = request.body;
      
      try {
        await sequelize.transaction(async (t) => {
          // Update user data
          await User.update(userData, {
            where: { id },
            transaction: t
          });
    
          // Update preferences based on user type
          const PreferenceModel = userType === 'searcher' ? searcherPreferences : providerPreferences;
          await PreferenceModel.update(preferences, {
            where: { id },
            transaction: t
          });
        });
    
        return response.json({ success: true });
      } catch (error) {
        console.error('Error in updateUserData:', error);
        return response.json({ success: false, error: 'Update failed' });
      }
    };