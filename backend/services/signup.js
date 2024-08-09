const validator = require("validator");
const bcrypt = require("bcrypt");
const sharp = require("sharp");
const { parsePhoneNumberFromString } = require('libphonenumber-js');
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
} = require("./global");
const { singupSuccessEmail } = require("./mailer");
const { v4: uuidv4 } = require('uuid');

exports.signup = async (request, response, User, searcherPreferences, providerPreferences) => {
  let errors = [];
  console.log(request.body)
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
    uploadImage(image, process.cwd() + "/uploads/searcherImages/" + userId + ".webp", errors)
   
  } else if (data.type == "IchhabeeinZimmer") {
    const images = request.files["files[]"];
    console.log(request.files["files[]"])
    var imageIds = []
    //multi image upload
    uploadedImages = await Promise.all(images.map(async (image) => {
      const uuid = uuidv4()
      imageIds.push(uuid)
      return await uploadImage(image, process.cwd() + "/uploads/providerImages/" + uuid + ".webp", errors);
    }));

    newPreferenceEntry.images = imageIds;
    newPreferenceEntry.save()
  }

  //send success email with email verification link
  singupSuccessEmail(data.eMail, data.firstName, userId, data.type);

  if (errors.length <= 0)
    return response.json({
      success: true,
      token: await generateAccessToken(userId),
    });
  return response.json({
    success: true,
    message: "trueFalse",
    errors: errors,
    token: await generateAccessToken(userId),
  });
};


//validate user inputs from searchers (on error setting medium values)
async function validateSearcher(data, errors) {
  //one to ten selects check for validity
  ten.forEach((element) => {
    if (!arrayTen.includes(Number(data[element]))) {
      //console.log(element, data[element]);
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

//console.log(amentitieProximity('[Street], [ZIP City]'))

async function amentitieProximity(address, newPreferenceEntry) {
  var latitude = 0;
  var longitude = 0;
  //get coordinates
  await fetch(
    `https://geocode.maps.co/search?q=${address}&api_key=663de6e18d609818847521uwqbeba8c`
  )
    .then((response) => response.json())
    .then((data) => {
      //console.log(address)
      //console.log(data)
      latitude = data[0].lat;
      longitude = data[0].lon;
    });
  const radius = 4000; // Search radius for amenities in meters
  newPreferenceEntry.longitude = longitude;
  newPreferenceEntry.latitude = latitude;
  // Fetch data for public transport stops and supermarkets from OSM using Overpass API
  const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["highway"="bus_stop"](around:${radius},${latitude},${longitude});node["railway"="station"](around:${radius},${latitude},${longitude});node["shop"](around:${radius},${latitude},${longitude}););out;`;

  fetch(overpassUrl)
    .then((response) => response.json())
    .then((data) => {
      // Process data for public transport stops
      const publicTransportStops = data.elements.filter(
        (element) =>
          element.tags &&
          (element.tags.highway === "bus_stop" ||
            element.tags.railway === "station")
      );
      const publicTransportData = publicTransportStops.map((stop) => ({
        type: stop.tags.highway === "bus_stop" ? "Bus Stop" : "Train Station",
        name: stop.tags.name ? stop.tags.name : "Unnamed",
        lat: stop.lat,
        lon: stop.lon,
      }));

      // Process data for supermarkets
      const supermarkets = data.elements.filter(
        (element) => element.tags && element.tags.shop === "supermarket"
      );
      const supermarketData = supermarkets.map((supermarket) => ({
        type: "Supermarket",
        name: supermarket.tags.name ? supermarket.tags.name : "Unnamed",
        lat: supermarket.lat,
        lon: supermarket.lon,
      }));

      // Calculate walking distance to each public transport stop
      const publicTransportDistances = publicTransportData.map((stop) => {
        const walkingUrl = `http://156.67.28.73:8080/ors/v2/directions/foot-walking?api_key=5b3ce3597851110001cf624887530b44551b45fa975553e2aabd3f99&start=${longitude},${latitude}&end=${stop.lon},${stop.lat}`;
        return fetch(walkingUrl)
          .then((response) => response.json())
          .then((walkingData) => {
            const walkingDistance =
              walkingData.features[0].properties.summary.distance; // Walking distance in meters
            return { ...stop, distance: walkingDistance };
          });
      });

      // Calculate walking distance to each supermarket
      const supermarketDistances = supermarketData.map((supermarket) => {
        const walkingUrl = `http://156.67.28.73:8080/ors/v2/directions/foot-walking?api_key=5b3ce3597851110001cf624887530b44551b45fa975553e2aabd3f99&start=${longitude},${latitude}&end=${supermarket.lon},${supermarket.lat}`;
        return fetch(walkingUrl)
          .then((response) => response.json())
          .then((walkingData) => {
            const walkingDistance =
              walkingData.features[0].properties.summary.distance; // Walking distance in meters
            return { ...supermarket, distance: walkingDistance };
          });
      });

      var closestPublicTransport;
      // Find the closest public transport stop
      Promise.all(publicTransportDistances)
        .then((distances) => {
          closestPublicTransport = distances.reduce(
            (closest, current) => {
              return closest.distance < current.distance ? closest : current;
            }
          );

          newPreferenceEntry.transportData = closestPublicTransport;
          newPreferenceEntry.transportDistance = closestPublicTransport.distance;
          newPreferenceEntry.save();

        })
        .catch((error) => {
          console.error(
            "Error calculating walking distances for public transport:",
            error
          );
        });
        var closestSupermarket;
      // Find the closest supermarket
      Promise.all(supermarketDistances)
        .then((distances) => {
          closestSupermarket = distances.reduce((closest, current) => {
            return closest.distance < current.distance ? closest : current;
          });
          newPreferenceEntry.supermarketData = closestSupermarket;
         newPreferenceEntry.supermarketDistance = closestSupermarket.distance;
         newPreferenceEntry.save();
        })
        .catch((error) => {
          console.error(
            "Error calculating walking distances for supermarkets:",
            error
          );
        });
    })
    .catch((error) => {
      console.error("Error fetching or processing data:", error);
    });
    
};

//process and save image
async function uploadImage(image, filePath, errors){
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