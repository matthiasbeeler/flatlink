const validator = require("validator");
const bcrypt = require("bcrypt");
const {
  findUserWithEmail,
  ten,
  arrayFlatSize,
  arrayGender,
  arrayFood,
  arrayRoomSize,
  arrayTen,
  generateAccessToken,
  tenProvider,
  ynqProvider,
  ynTable,
  ynTableConversion,
  formatPhonenumber,
  uploadImage,
  amentitieProximity,
} = require("./global");
const { singupSuccessEmail } = require("./mailer");
const { v4: uuidv4 } = require('uuid');

exports.signup = async (request, response, User, searcherPreferences, providerPreferences) => {
  let errors = [];
  var data = JSON.parse(request.body.data);


  if (data.type == "IchsucheeinZimmer") {
    //validating user inputs
    await validateSearcher(data, errors);
  } else if (data.type == "IchhabeeinZimmer") {
    //validating user inputs
    await validateProvider(data, errors);
  }

  //checking if eMail is already registered
  const existingUser = await findUserWithEmail(User, data.eMail);
  //if eMail exists -> throw error to user
  if (existingUser)
    return response.json({ success: false, error: "emailExists" });

  var type = "searcher";
  if (data.type == "IchhabeeinZimmer") type = "provider";

  //formatting phonenumber

  const formattedPhonenumber = await formatPhonenumber(data.phoneCode+data.phonenumber)

  //creating the new user account
  const newUser = await User.create({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.eMail,
    phonenumber: formattedPhonenumber,
    password: bcrypt.hashSync(data.password, 10),
    userType: type,
  }).catch((err) => {
    // catch error if anything goes wrong
    console.log(err);
    return response.json({ success: false, error: "signupErr#1" });
  });

  var userId = newUser.id;
  data.id = userId;

  var newPreferenceEntry;

  if (data.type == "IchsucheeinZimmer") {
    //creating the userPreference entry
    newPreferenceEntry = await searcherPreferences
      .create(data)
      .catch((err) => {
        //on error newly created user gets deleted
        newUser.destroy();
        // catch error if anything goes wrong
        console.log(err);
        return response.json({ success: false, error: "signupErr#2" });
      });
  } else if (data.type == "IchhabeeinZimmer") {
    //creating the roomPreference entry
    newPreferenceEntry = await providerPreferences
      .create(data)
      .catch((err) => {
        // catch error if anything goes wrong
        console.log(err);
        //on error newly created user gets deleted
        newUser.destroy();
        return response.json({ success: false, error: "signupErr#3" });
      });
      var amenitieData = await amentitieProximity(data.street+", "+data.plz+ " "+data.place, newPreferenceEntry);
      newPreferenceEntry.save()
  }

  //image upload
  if (data.type == "IchsucheeinZimmer") {
    var image = request.files.image;
    //single image upload
    await uploadImage(image, process.cwd() + "/uploads/searcherImages/" + userId + ".webp", errors)
   
  } else if (data.type == "IchhabeeinZimmer") {
    const images = Array.isArray(request.files["files[]"]) 
    ? request.files["files[]"] 
    : [request.files["files[]"]]; 
    
    var imageIds = []
    //multi image upload
    uploadedImages = await Promise.all(images.map(async (image) => {
      const uuid = uuidv4()
      imageIds.push(uuid)
      return await uploadImage(image, process.cwd() + "/uploads/providerImages/" + uuid + ".webp", errors, process.cwd() + "/uploads/providerImagesCompressed/" + uuid + ".webp",);
    }));

    newPreferenceEntry.images = imageIds;
    newPreferenceEntry.save()
  }

  //send success email with email verification link
  singupSuccessEmail(data.eMail, data.firstName, userId, data.type);
 
  if (errors.length <= 0)
    return response.json({
      success: true,
      token: await generateAccessToken(userId, data.type == "IchhabeeinZimmer" ? "provider" : "searcher"),
    });
  return response.json({
    success: true,
    message: "trueFalse",
    errors: errors,
    token: await generateAccessToken(userId, data.type == "IchhabeeinZimmer" ? "provider" : "searcher"),
  });
};


//validate user inputs from searchers (on error setting medium values)
async function validateSearcher(data, errors) {
  //one to ten selects check for validity
  ten.forEach((element) => {
    if (!arrayTen.includes(Number(data[element]))) {
      data[element] = "5";
      errors.push(element);
    }
  });
  //checking individual selects for validity
  if (!arrayGender.includes(data["genderPreference"])) {
    data.genderPreference = "none";
    errors.push("genderPreference");
  }
  if (!arrayGender.includes(data["gender"])) {
    data.gender = "none";
    errors.push("gender");
  }
  if (!arrayRoomSize.includes(data["roomSize"])) {
    data.roomSize = "9-14";
    errors.push("roomSize");
  }
  if (!arrayFlatSize.includes(data["flatSize"])) {
    data.flatSize = "41-90";
    errors.push("flatSize");
  }
  if (!arrayFood.includes(data["food"])) {
    data.food = "none";
    errors.push("food");
  }
  if (!data["description"]) {
    data.description = "No description found.";
    errors.push("description");
  }
  if (!(isFinite(data.preferredLat) && Math.abs(data.preferredLat) <= 90)) {
    // Zurich trainstation as medium value
    data.preferredLat = "47.378099";
    errors.push("preferredLat");
  }
  if (!(isFinite(data.preferredLon) && Math.abs(data.preferredLon) <= 90)) {
    // Zurich trainstation as medium value
    data.preferredLon = "8.539352";
    errors.push("preferredLon");
  }
  if (isNaN(data.budget)) {
    data.budget = "500";
    errors.push("budget");
  }
}

async function validateProvider(data, errors) {
  //one to ten selects check for validity
  tenProvider.forEach((element) => {
    if (!arrayTen.includes(Number(data[element]))) {
      data[element] = "5";
      errors.push(element);
    }
  });
  //yes or no selects check for validity
  ynqProvider.forEach((element) => {
    if (!ynTable.includes(data[element])) {
      data[element] = "Nein";
      errors.push(element);
    }
    //converting "Ja" and "Nein" to 1 and 0
    data[element] = ynTableConversion[data[element]];
  });
  //checking individual selects for validity
  if (!arrayGender.includes(data["genderPreference"])) {
    data.genderPreference = "none";
    errors.push("genderPreference");
  }
  if (isNaN(data["roomSize"])) {
    data.roomSize = "15";
    errors.push("roomSize");
  }
  if (isNaN(data["flatSize"])) {
    data.flatSize = "90";
    errors.push("flatSize");
  }
  if (!arrayFood.includes(data["food"])) {
    data.food = "none";
    errors.push("food");
  }
  if (!data["description"]) {
    data.description = "No description found.";
    errors.push("description");
  }
}

