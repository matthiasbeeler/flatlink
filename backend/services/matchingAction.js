const validator = require("validator");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("../database/models");
const { request, response } = require("express");
const { v4: uuidv4 } = require("uuid");
const { uploadImage, amentitieProximity } = require("./global");

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
  const log = await matchLog.create({
    searcherId: userId,
    providerId: request.body.providerId,
    matchType: true,
  });
};

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
  const log = await matchLog.create({
    searcherId: userId,
    providerId: request.body.providerId,
    matchType: false,
  });
};

exports.getLikedMatch = async (
  request,
  response,
  matchLog,
  providerPreferences
) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  //joining tables matchLog and providerPreference to get the providerData
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

exports.updateSearcherPreferences = async (
  request,
  response,
  searcherPreferences
) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  try {
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

    console.log(`Updated ${updatedRowsCount} row(s)`);
    return response.json({ success: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

exports.updateProviderPreferences = async (
  request,
  response,
  providerPreferences,
  searcherPreferences
) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
  const images = request.files["files[]"];
  var imageIds = [];
  //multi image upload
  uploadedImages = await Promise.all(
    images.map(async (image) => {
      const uuid = uuidv4();
      imageIds.push(uuid);
      return await uploadImage(
        image,
        process.cwd() + "/uploads/providerImages/" + uuid + ".webp",
        []
      );
    })
  );
  try {
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
    await amentitieProximity(
      request.body.street + ", " + request.body.place + " " + request.body.plz,
      await providerPreferences.findOne({ where: { id: userId } })
    );
    if (updatedRowsCount === 0) {
      console.log("No user found with the given ID");
      return response.json({
        success: false,
        message: "No user found with the given ID",
      });
    }
    console.log(`Updated ${updatedRowsCount} row(s)`);
    return response.json({ success: true });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};
