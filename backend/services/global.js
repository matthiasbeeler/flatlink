const jwt = require("jsonwebtoken");

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

//global preference variables
exports.arrayTen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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