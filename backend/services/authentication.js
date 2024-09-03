const validator = require("validator");
const bcrypt = require("bcrypt");
const { generateAccessToken, passwordRegex } = require("./global");
const { passwordForgottenEmail } = require("./mailer");
const jwt = require("jsonwebtoken");
exports.login = async (request, response, User) => {
  if (!request.body.email || !request.body.password)
    return response.json({ success: false, error: 1 });
  var password = request.body.password;
  var email = request.body.email;
  if (validator.isEmpty(email) || validator.isEmpty(password))
    return response.json({
      success: false,
      error: 1,
      message: "Bitte alle Felder ausfüllen",
    });
  if (!validator.isEmail(email))
    return response.json({
      success: false,
      error: 2,
      message: "Bitte gib deine eMail Adresse an.",
    });
  var user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (user) await validateUser(user.dataValues.password, password);

  async function validateUser(hash, password) {
    const accessToken = await generateAccessToken(
      user.dataValues.id,
      user.dataValues.userType
    );
    bcrypt
      .compare(password, hash)
      .then((res) => {
        if (res === true) {
          return response.json({ success: true, token: accessToken });
        } else {
          return response.json({
            success: false,
            error: 2,
            message: "Kein Account wurde gefunden.",
          });
        }
      })
      .catch((err) => console.error(err.message));
  }
  if (!user)
    return response.json({
      success: false,
      error: 2,
      message: "Kein Account wurde gefunden.",
    });
};

exports.passwordForgotten = async (request, response, User) => {
  if (!request.body.email)
    return response.json({
      success: false,
      error: 1,
      message: "eMail nicht gefunden",
    });
  var email = request.body.email;
  if (validator.isEmpty(email))
    return response.json({
      success: false,
      error: 1,
      message: "Bitte alle Felder ausfüllen",
    });
  if (!validator.isEmail(email))
    return response.json({
      success: false,
      error: 2,
      message: "Bitte gib deine eMail Adresse an.",
    });
  var user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (user) {
    passwordForgottenEmail(email, user.id);
    return response.json({
      success: true,
    });
  }

  if (!user)
    return response.json({
      success: false,
      error: 2,
      message: "Kein Account wurde gefunden.",
    });
};

exports.resetPassword = async (request, response, Users) => {
  if (!request.body.token)
    return response.json({
      success: false,
      message: "Invalider token",
    });
  if (
    jwt.verify(request.body.token, process.env.jwtSecret).data.type !==
    "password"
  )
    return response.json({
      success: false,
      message: "Invalider token",
    });
  const userId = jwt.verify(request.body.token, process.env.jwtSecret).data.id;
  var password = request.body.password;

  //checking if password fullfills requirements
  if (!passwordRegex.test(password))
    return response.json({
      success: false,
      message: "Passwort folgt nicht den vorgaben",
    });

  //getting user
  var user = await Users.findOne({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return response.json({ success: false, message: "Nutzer nicht gefunden" });
  }

  //updating pasword
  (user.password = await bcrypt.hashSync(password, 10)), await user.save();

  return response.json({ success: true });
};



exports.accountStatus = async (request, response, User) => {
  if (!request.body.email)
    return response.json({ success: false, error: 1 });
  var email = request.body.email;
  if (validator.isEmpty(email))
    return response.json({
      success: false,
      error: 1,
      message: "Bitte alle Felder ausfüllen",
    });
  if (!validator.isEmail(email))
    return response.json({
      success: false,
      error: 2,
      message: "Bitte gib deine eMail Adresse an.",
    });
  var user = await User.findOne({
    where: {
      email: email,
    },
  });
  if (user) return response.json({ success: true, type: "login" });
  return response.json({ success: true, type: "signup", email });
  

};