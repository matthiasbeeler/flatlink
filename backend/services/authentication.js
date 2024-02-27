const validator = require('validator')
const bcrypt = require('bcrypt');

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
  if(user) validateUser(user.dataValues.password, password)
  
  function validateUser(hash, password) {
    bcrypt
      .compare(password, hash)
      .then(res => {
        console.log(res) // return true
  response.json({success: true})

      })
      .catch(err => console.error(err.message))        
}
}