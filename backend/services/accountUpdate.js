const jwt = require("jsonwebtoken");
const { formatPhonenumber, passwordRegex, uploadImage } = require("./global");
const moment = require("moment");
var validator = require("validator");
const { emailAddressUpdate } = require("./mailer");
const bcrypt = require("bcrypt");

exports.updatePhonenumber = async function (request, response, User) {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  const phonenumber = request.body.phonenumber;
  const phoneCode = request.body.phoneCode;

  //formating phonenumber
  const formattedPhonenumber = await formatPhonenumber(phoneCode + phonenumber);
  //getting user
  var user = await User.findOne({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return response.json({ success: false, message: "Nutzer nicht gefunden " });
  }

  //check for update not more than every 24h
  if (user.lastPhoneNumberUpdate) {
    const lastUpdate = moment(user.lastPhoneNumberUpdate);
    const now = moment();
    const difference = now.diff(lastUpdate, "hours");
    if (difference < 24) {
      return response.json({
        success: false,
        message:
          "Deine Telefonnummer kannst Du ein Mal innert 24 Stunden ändern.",
      });
    }
  }

  //check if phonenumber is used
  var phonenumberUse = await User.findOne({
    where: {
      phonenumber: formattedPhonenumber,
    },
  });
  if (phonenumberUse) {
    return response.json({
      success: false,
      message: "Telefonnummer wird bereits genutzt.",
    });
  }
  //update phonenumber
  user.phonenumber = String(formattedPhonenumber);
  user.lastPhoneNumberUpdate = moment().toDate();
  await user.save();

  var token = await jwt.sign({ data: { id: userId } }, process.env.jwtSecret, {
    expiresIn: "365d",
  });
  return response.json({ success: true, token });
};

exports.updateEmail = async function (request, response, User) {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  var emailAddress = request.body.email;
  var emailAddress = emailAddress.trim().replace(/\s{2,}/g, " ");
  if (!emailAddress)
    return response.json({
      success: false,
      error: 2,
      message: "Fülle alle Felder aus",
    });

  //checking for valid eMail address
  if (!validator.isEmail(emailAddress))
    return response.json({
      success: false,
      error: 11,
      message: "eMail nicht gültig",
    });

  //getting user
  var user = await User.findOne({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return response.json({ success: false, message: "Nutzer nicht gefunden " });
  }
  //check for update not more than every 24h
  if (user.lastEmailUpdate) {
    const lastUpdate = moment(user.lastEmailUpdate);
    const now = moment();
    const difference = now.diff(lastUpdate, "hours");
    if (difference < 24) {
      return response.json({
        success: false,
        message: "Deine eMail kannst Du ein Mal innert 24 Stunden ändern.",
      });
    }
  }

  //check if email is used
  var emailUse = await User.findOne({
    where: {
      email: emailAddress,
    },
  });
  if (emailUse) {
    return response.json({
      success: false,
      message: "eMail wird bereits genutzt.",
    });
  }

  //updating email
  user.email = emailAddress;
  user.lastEmailUpdate = moment().toDate();
  await user.save();
  await emailAddressUpdate(emailAddress, user.firstName, userId);
  var token = await jwt.sign({ data: { id: userId } }, process.env.jwtSecret, {
    expiresIn: "365d",
  });
  return response.json({ success: true, token });
};

exports.updateJob = async function (request, response, searcherPreferences) {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  var job = request.body.job;

  //getting user
  var user = await searcherPreferences.findOne({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return response.json({ success: false, message: "Nutzer nicht gefunden " });
  }

  //updating job
  user.occupation = job;
  await user.save();
  var token = await jwt.sign({ data: { id: userId } }, process.env.jwtSecret, {
    expiresIn: "365d",
  });
  return response.json({ success: true, token });
};

exports.updatePassword = async function (request, response, Users) {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
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
    return response.json({ success: false, message: "Nutzer nicht gefunden " });
  }

  //updating pasword
  (user.password = await bcrypt.hashSync(password, 10)), await user.save();
  var token = await jwt.sign({ data: { id: userId } }, process.env.jwtSecret, {
    expiresIn: "365d",
  });
  return response.json({ success: true, token });
};

exports.updateProfileImage = async function (request, response, User) {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;

  //getting user
  var user = await User.findOne({
    where: {
      id: userId,
    },
  });
  if (!user) {
    return response.json({ success: false, message: "Nutzer nicht gefunden " });
  }
  //check for update not more than every 24h
  if (user.lastProfileImageUpdate) {
    const lastUpdate = moment(user.lastProfileImageUpdate);
    const now = moment();
    const difference = now.diff(lastUpdate, "hours");
    if (difference < 24) {
      return response.json({
        success: false,
        message: "Dein Profilbild kannst Du ein Mal innert 24 Stunden ändern.",
      });
    }
  }

  var image = request.files.image;
  //single image upload
  await uploadImage(
    image,
    process.cwd() + "/uploads/searcherImages/" + userId + ".webp",
    []
  );

  //updating email
  user.lastProfileImageUpdate = moment().toDate();
  await user.save();

  var token = await jwt.sign({ data: { id: userId } }, process.env.jwtSecret, {
    expiresIn: "365d",
  });
  return response.json({ success: true, token });
};
