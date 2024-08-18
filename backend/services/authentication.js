const validator = require('validator')
const bcrypt = require('bcrypt');
const { generateAccessToken } = require('./global');



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
  if(user) await validateUser(user.dataValues.password, password)
  
  async function validateUser(hash, password) {
    const accessToken = await generateAccessToken(user.dataValues.id, user.dataValues.userType);
    bcrypt
      .compare(password, hash)
      .then(res => {
        if(res === true){ 
          return response.json({success: true, token: accessToken})
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