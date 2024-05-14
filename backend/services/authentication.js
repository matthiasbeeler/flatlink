const validator = require('validator')
const bcrypt = require('bcrypt');
const { generateAccessToken } = require('./global');

//generates JWT with expiartion of 365 days - returns JWT token containing user-ID


exports.login = async (request, response, User) =>{
    if (!request.body.email || !request.body.password) return response.json({ success: false, error: 1 });
  var password = request.body.password;
  var email = request.body.email;
  if (validator.isEmpty(email) || validator.isEmpty(password))
    return response.json({
      success: false,
      error: 1,
      message: "Bitte alle Felder ausfüllen",
    });
  if (!validator.isEmail(email)) return response.json({
    success: false,
    error: 2,
    message: "Bitte gib deine eMail Adresse an.",
  });
  var user = await User.findOne({
    where: {
        email: email
    }
  })
  console.log(user)
  if(user) validateUser(user.dataValues.password, password)
  
  function validateUser(hash, password) {
    bcrypt
      .compare(password, hash)
      .then(res => {
        if(res === true){ 
          return response.json({success: true, token:generateAccessToken(user.dataValues.id)})
        }else{
          return response.json({
            success: false,
            error: 2,
            message: "Kein Account wurde gefunden.",
          }); 
        }

      })
      .catch(err => console.error(err.message))        
}
if(!user) return response.json({
  success: false,
  error: 2,
  message: "Kein Account wurde gefunden.",
}); 
}