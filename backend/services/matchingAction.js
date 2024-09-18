const validator = require("validator");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("../database/models");
const { request, response } = require("express");
const { v4: uuidv4 } = require("uuid");
const { uploadImage, amentitieProximity } = require("./global");

// Function to handle liking a match
exports.likeMatch = async (
  request,
  response,
  User,
  searcherPreferences,
  providerPreferences,
  matchLog
) => {
  const providerId = request.body.providerId;
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;

  // Delete any existing match log
  await matchLog.destroy({
    where: {
      searcherId: userId,
      providerId: request.body.providerId,
    },
  });
  // Create a new match log with matchType true (like)
  const log = await matchLog.create({
    searcherId: userId,
    providerId: request.body.providerId,
    matchType: true,
  });
};

// Function to handle disliking a match
exports.dislikeMatch = async (
  request,
  response,
  User,
  searcherPreferences,
  providerPreferences,
  matchLog
) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  // Delete any existing match log
  await matchLog.destroy({
    where: {
      searcherId: userId,
      providerId: request.body.providerId,
    },
  });
  // Create a new match log with matchType false (dislike)
  const log = await matchLog.create({
    searcherId: userId,
    providerId: request.body.providerId,
    matchType: false,
  });
};

// Function to get liked matches for a searcher
exports.getLikedMatch = async (
  request,
  response,
  matchLog,
  providerPreferences
) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  // Join matchLog and providerPreferences tables to get provider data
  const logs = await matchLog.findAll({
    where: {
      searcherId: userId,
      matchType: true,
    },
    include: [
      {
        model: providerPreferences,
        required: false,
      },
    ],
    raw: true,
    nest: true,
  });
  response.json({ success: true, logs: logs });
};

// Function to get searchers who liked a provider
exports.getLikedSearcher = async (
  request,
  response,
  matchLog,
  searcherPreferences,
  User
) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  // Join matchLog, searcherPreferences, and User tables to get searcher data
  const logs = await matchLog.findAll({
    where: {
      providerId: userId,
      matchType: true,
    },
    include: [
      {
        model: searcherPreferences,
        required: false,
      },
      {
        model: User,
        required: false,
        attributes: ['firstName', 'lastName', 'phonenumber'], 
      },
    ],
    raw: true,
    nest: true,
  });
  response.json({ success: true, logs: logs });
};

// Function to update searcher preferences
exports.updateSearcherPreferences = async (
  request,
  response,
  searcherPreferences
) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  try {
    // Update searcher preferences in the database
    const [updatedRowsCount, updatedRows] = await searcherPreferences.update(
      {
        genderPreference: request.body.genderPreference,
        cleanliness: request.body.cleanliness,
        quietness: request.body.quietness,
        accessibility: request.body.accessibility,
        flatmates: request.body.flatmates,
        roomSize: request.body.roomSize,
        flatSize: request.body.flatSize,
        balcony: request.body.balcony,
        internet: request.body.internet,
        washer: request.body.washer,
        location: request.body.location,
        connections: request.body.connections,
        budget: request.body.budget,
        gender: request.body.gender,
        food: request.body.food,
        description: request.body.description,
      },
      {
        where: { id: userId },
        returning: true,
      }
    );

    if (updatedRowsCount === 0) {
      console.log("No user found with the given ID");
      return response.json({
        success: false,
        message: "No user found with the given ID",
      });
    }

    return response.json({ success: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

// Function to update provider preferences
exports.updateProviderPreferences = async (
  request,
  response,
  providerPreferences,
  searcherPreferences
) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  // Handle image uploads
  const images = Array.isArray(request.files["files[]"]) 
    ? request.files["files[]"] 
    : [request.files["files[]"]]; 
  
  var imageIds = [];
  
  uploadedImages = await Promise.all(
    images.map(async (image) => {
      const uuid = uuidv4();
      imageIds.push(uuid);
      return await uploadImage(
        image,
        process.cwd() + "/uploads/providerImages/" + uuid + ".webp",
        [],
        process.cwd() + "/uploads/providerImagesCompressed/" + uuid + ".webp",
      );
    })
  );
  try {
    // Update provider preferences in the database
    const [updatedRowsCount, updatedRows] = await providerPreferences.update(
      {
        genderPreference: request.body.genderPreference,
        cleanliness: Number(request.body.cleanliness),
        quietness: Number(request.body.quietness),
        accessibility: Number(request.body.accessibility),
        flatmates: Number(request.body.flatmates),
        roomSize: Number(request.body.roomSize),
        flatSize: Number(request.body.flatSize),
        balcony: request.body.balcony.trim().toLowerCase() === "ja" ? 1 : 0,
        internet: request.body.internet.trim().toLowerCase() === "ja" ? 1 : 0,
        washer: request.body.washer.trim().toLowerCase() === "ja" ? 1 : 0,
        street: request.body.street,
        plz: Number(request.body.plz),
        place: request.body.place,
        price: Number(request.body.price),
        food: request.body.food,
        description: request.body.description,
        images: imageIds,
      },
      {
        where: { id: userId },
        returning: true,
      }
    );
    // Update amenity proximity data
    await amentitieProximity(
      request.body.street + ", " + request.body.place + " " + request.body.plz,
      await providerPreferences.findOne({ where: { id: userId } })
    );
    if (updatedRowsCount === 0) {
      return response.json({
        success: false,
        message: "No user found with the given ID",
      });
    }
    return response.json({ success: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};