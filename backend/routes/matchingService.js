var express = require('express');
var router = express.Router();
const { User, searcherPreferences, providerPreferences, matchLog }= require('../database/models');
const { accountData } = require('../services/userData');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const { matching } = require('../services/matching');


router.all("*", function (req, res, next) {
  try {

  if(req.body.flatlinkAuth){
    if(uuid.validate(jwt.verify(req.body.flatlinkAuth, process.env.jwtSecret).data.id)) return next()
    return  res.sendStatus(404)
  } else if(!req.body.flatlinkAuth){
    return   res.sendStatus(404)
  }
} catch (error) {
  res.sendStatus(404)
    console.log(error)
}
})


var provider = [
     ];

     const { v4: uuidv4 } = require('uuid');
const { likeMatch, dislikeMatch, getLikedMatch, updateSearcherPreferences, updateProviderPreferences, getLikedSearcher } = require('../services/matchingAction');
     const places = [
       { name: 'Zürich', plz: 8000 },
       { name: 'Genève', plz: 1200 },
       { name: 'Basel', plz: 4000 },
       { name: 'Bern', plz: 3000 },
       { name: 'Lausanne', plz: 1000 },
       { name: 'Winterthur', plz: 8400 },
       { name: 'St. Gallen', plz: 9000 },
       { name: 'Luzern', plz: 6000 },
       { name: 'Lugano', plz: 6900 },
       { name: 'Biel/Bienne', plz: 2500 },
       // Add more places as needed
     ];
     
     const streetNames = [
       'Bahnhofstrasse', 'Hauptstrasse', 'Dorfstrasse', 'Kirchstrasse', 'Poststrasse',
       'Schulstrasse', 'Marktgasse', 'Ringstrasse', 'Gartenstrasse', 'Allmendstrasse',
       // Add more street names as needed
     ];
     
     const supermarketNames = ['Migros', 'Coop', 'Denner', 'Aldi', 'Lidl'];
     
     // Bounding box coordinates for Switzerland
     const switzerlandBounds = {
       minLat: 45.8175, // South
       maxLat: 47.8085, // North
       minLon: 5.9557, // West
       maxLon: 10.4923, // East
     };
     
     const generateStreetAddress = (place) => {
       const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
       const streetNumber = Math.floor(Math.random() * 200) + 1;
       const street = `${streetName} ${streetNumber}`;
       return { street, plz: place.plz };
     };
     
     const generateRandomEntry = () => {
       const place = places[Math.floor(Math.random() * places.length)];
       const { street, plz } = generateStreetAddress(place);
     
       // Generate coordinates within Switzerland
       const lat = switzerlandBounds.minLat + Math.random() * (switzerlandBounds.maxLat - switzerlandBounds.minLat);
       const lon = switzerlandBounds.minLon + Math.random() * (switzerlandBounds.maxLon - switzerlandBounds.minLon);
     
       const supermarketName = supermarketNames[Math.floor(Math.random() * supermarketNames.length)];
       const supermarketLat = lat + (Math.random() - 0.5) * 0.02;
       const supermarketLon = lon + (Math.random() - 0.5) * 0.02;
     
       const transportType = Math.random() < 0.5 ? 'Bus Stop' : 'Train Station';
       const transportName = `${place.name} ${transportType}`;
       const transportLat = lat + (Math.random() - 0.5) * 0.01;
       const transportLon = lon + (Math.random() - 0.5) * 0.01;
     
       const entry = {
         id: uuidv4(),
         accessibility: Math.floor(Math.random() * 10) + 1,
         balcony: Math.random() < 0.5,
         price: Math.floor(Math.random() * 801) + 400,
         cleanliness: Math.floor(Math.random() * 10) + 1,
         flatmates: Math.floor(Math.random() * 6),
         flatSize: Math.floor(Math.random() * 61) + 40,
         food: ['none', 'vegetarian', 'vegan'][Math.floor(Math.random() * 3)],
         
         genderPreference: ['none', 'male', 'female', 'intersex'][Math.floor(Math.random() * 4)],
         internet: Math.random() < 0.5,
         quietness: Math.floor(Math.random() * 10) + 1,
         roomSize: Math.floor(Math.random() * 16) + 10,
         washer: Math.random() < 0.5,
         intersexFlatmates: 0,
         description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
         street,
         place: place.name,
         plz,
         transportDistance: (Math.random() * 1000).toFixed(1),
         supermarketDistance: (Math.random() * 2000).toFixed(1),
         transportData: `{"type":"${transportType}","name":"${transportName}","lat":${transportLat},"lon":${transportLon},"distance":${(Math.random() * 1000).toFixed(1)}}`,
         supermarketData: `{"type":"Supermarket","name":"${supermarketName}","lat":${supermarketLat},"lon":${supermarketLon},"distance":${(Math.random() * 2000).toFixed(1)}}`,
         latitude: lat,
         longitude: lon,
         images: null,
         createdAt: '2024-06-14 10:31:41.746+02',
         updatedAt: '2024-06-14 10:31:46.31+02',
       };
     
       entry.maleFlatmates = Math.floor(Math.random() * (6 - entry.flatmates));
         entry.femaleFlatmates = Math.floor(Math.random() * (6 - entry.flatmates));
         entry.noneFlatmates =  Math.floor(Math.random() * (6 - entry.flatmates));
       return entry;
     };

/*
 router.post('/hi', async(req, res) => {
       
     const entries = [];
     for (let i = 0; i < 10000; i++) {
       entries.push(generateRandomEntry());
     }
    const captains = await providerPreferences.bulkCreate(entries);

    console.log(captains.length); // 2
    console.log(captains[0].name); // 'Jack Sparrow'
    console.log(captains[0].id);
    return res.json({success: true})
  });
*/
router.post('/getMatch', async (req, res) => {
  await matching(req,res,User,searcherPreferences,providerPreferences, matchLog)
})

router.post('/likeMatch', async (req, res) => {
  await likeMatch(req,res,User,searcherPreferences,providerPreferences, matchLog)
})

router.post('/dislikeMatch', async (req, res) => {
  await dislikeMatch(req,res,User,searcherPreferences,providerPreferences, matchLog)
})


router.post('/getLikedMatch', async (req, res) => {
  if(req.body.userType == "searcher") return await getLikedMatch(req,res, matchLog, providerPreferences)
  if(req.body.userType == "provider") return await getLikedSearcher(req,res, matchLog, searcherPreferences)
})


router.post('/updateSearcherPreferences', async (req, res) => {
  await updateSearcherPreferences(req,res,searcherPreferences)
})

router.post('/updateProviderPreferences', async (req, res) => {
  await updateProviderPreferences(req,res,providerPreferences)
})




module.exports = router;
