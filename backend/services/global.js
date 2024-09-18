const jwt = require("jsonwebtoken");
const { parsePhoneNumber } = require("libphonenumber-js");
const sharp = require("sharp");

exports.generateAccessToken = async function (id, userType) {
  return await jwt.sign({ data: { id, userType } }, process.env.jwtSecret, {
    expiresIn: "365d",
  });
};

//find user with eMail
exports.findUserWithEmail = async function (User, email) {
  const user = await User.findOne({
    where: {
      email: email,
    },
  });
  return user;
};

//formatphonenumber
exports.formatPhonenumber = async function (fullNumber) {
  // Check if the number starts with '417'

  if (fullNumber.startsWith("+41417")) {
    fullNumber = "+41" + fullNumber.slice(5);
  }
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
};

//global image upload function (including compressed v. for provider)
exports.uploadImage = async function (
  image,
  filePath,
  errors,
  filePathCompressed
) {
  await sharp(image.data)
    .rotate()
    .webp({ quality: 80 })
    .toFile(filePath, (err, info) => {
      if (err) console.log(err);
      if (err) errors.push("image");
      console.log(info, )
    });

  if (filePathCompressed) {
    console.log("hi")
    await sharp(image.data)
      .rotate()
      .resize({ 
        height: 300, 
        fit: 'contain', 
      }).webp({ quality: 80 })
      .toFile(filePathCompressed, (err, info) => {
        console.log(info, filePathCompressed)
        if (err) console.log(err);
        if (err) errors.push("image");
      });
  }
};

exports.amentitieProximity = async function (address, newPreferenceEntry) {
  var latitude = 0;
  var longitude = 0;
  //get coordinates
  await fetch(
    `https://geocode.maps.co/search?q=${address}&api_key=663de6e18d609818847521uwqbeba8c`
  )
    .then((response) => response.json())
    .then((data) => {
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
          closestPublicTransport = distances.reduce((closest, current) => {
            return closest.distance < current.distance ? closest : current;
          });

          newPreferenceEntry.transportData = closestPublicTransport;
          newPreferenceEntry.transportDistance =
            closestPublicTransport.distance;
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
  "noneFlatmates",
];

exports.ynqProvider = ["balcony", "internet", "washer"];

exports.ynTable = ["Ja", "Nein"];
exports.ynTableConversion = {
  Ja: 1,
  Nein: 0,
};

exports.passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
