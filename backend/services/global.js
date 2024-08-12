const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require('libphonenumber-js');
const sharp = require("sharp");

exports.generateAccessToken =  async function(id) {
    return await jwt.sign({data:{id: id}}, process.env.jwtSecret, {expiresIn: '365d'});
  }

//find user with eMail
exports.findUserWithEmail = async function(User, email){
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    return user
  }

  //formatphonenumber
exports.formatPhonenumber = async function(fullNumber) {
  const phoneNumber = parsePhoneNumber(fullNumber, "CH");
  const internationalFormat = phoneNumber.formatInternational();

  // check if it could be a swiss number or not
  if (
      internationalFormat.includes("+41") &&
      (internationalFormat.match(/ /g) || []).length === 1 &&
      phoneNumber[0] === "0" &&
      phoneNumber[0] !== "0"
  ) {
      const newPhoneNumber = parsePhoneNumber("0" + sPhoneNumberString, "CH");
      return newPhoneNumber.formatInternational();
  }
  return internationalFormat;
}

//global image upload function
exports.uploadImage = async function(image, filePath, errors){
  await sharp(image.data)
  .rotate()
  .webp({ quality: 80 })
  .toFile(
   filePath,
    (err, info) => {
      console.log(err);
      if (err) console.log(err);
      if (err) errors.push("image");
    }
  );
}

//global preference variables
exports.arrayTen = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
exports.arrayGender = ["male", "female", "intersex", "none"];
exports.arrayRoomSize = ["1-8", "9-14", "15-20", "21+"];
exports.arrayFlatSize = ["1-40", "41-90", "91-140", "141+"];
exports.arrayFood = ["none", "vegan", "vegetarian"];
exports.ten = [
    "accessibility",
    "quietness",
    "cleanliness",
    "flatmates",
    "balcony",
    "connections",
    "internet",
    "washer",
  ];
  exports.tenProvider = [
    "accessibility",
    "quietness",
    "cleanliness",
    "flatmates",
    "intersexFlatmates",
    "maleFlatmates",
    "femaleFlatmates",
    "noneFlatmates"
  ];

exports.ynqProvider = [
  "balcony",
  "internet",
  "washer",
]

exports.ynTable = [
  "Ja",
  "Nein",
]
exports.ynTableConversion = {
  "Ja": 1,
  "Nein": 0,
}

exports.passwordRegex =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
