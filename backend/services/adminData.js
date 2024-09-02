const jwt = require("jsonwebtoken");


exports.getStartStats = async (request, response, User) =>{
    const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret).data.id;

    const searcherCount = await User.count({
        where: { userType: 'searcher' }
      });
  
      const providerCount = await User.count({
        where: { userType: 'provider' }
      });
    
   response.json({searcherCount, providerCount, success: true})
  }