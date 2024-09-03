const jwt = require("jsonwebtoken");


exports.getStartStats = async (request, response, User, matchLog) =>{
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