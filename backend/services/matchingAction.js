const validator = require("validator");
const jwt = require("jsonwebtoken");
const { Sequelize } = require("../database/models");
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

exports.getLikedMatch = async (request, response, matchLog, providerPreferences) => {
  const userId = jwt.verify(request.body.flatlinkAuth, process.env.jwtSecret)
    .data.id;
    //joining tables matchLog and providerPreference to get the providerData
    const logs = await matchLog.findAll({
      where: {
        searcherId: userId,
        matchType: true,
      },
      include: [{
        model: providerPreferences,
        required: false,
      }],
      raw: true,
      nest: true
    });
  response.json({ success: true, logs: logs });
};
