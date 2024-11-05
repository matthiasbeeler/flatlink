var express = require("express");
var router = express.Router();
const {
  User,
  searcherPreferences,
  providerPreferences,
  matchLog
} = require("../database/models");
const { accountData, allData } = require("../services/userData");
const uuid = require("uuid");
const { validate } = require("uuid");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const {
  updatePhonenumber,
  updateEmail,
  updateJob,
  updatePassword,
  updateProfileImage,
  verifyEmail,
  resendVerificationEmail,
} = require("../services/accountUpdate");
const { getStartStats, filterUserAccounts, getUserData, updateUserData } = require("../services/adminData");




router.all("*", function (req, res, next) {
    //checking if user is logged on pust ! -> 404 
  try {
    if (req.body.flatlinkAuth) {
        if(uuid.validate(jwt.verify(req.body.flatlinkAuth, process.env.jwtSecret).data.id) && jwt.verify(req.body.flatlinkAuth, process.env.jwtSecret).data.userType == "admin") return next();
      return res.sendStatus(404);
    } else if (!req.body.flatlinkAuth) {
      return res.sendStatus(404);
    }
  } catch (error) {
    res.sendStatus(404);
    console.log(error);
  }
});

router.post("/getStartStats", async (req, res, next) => {
    await getStartStats(req, res, User, matchLog);
  });


  router.post("/filterUserAccounts", async (req, res, next) => {
    await filterUserAccounts(req, res, User, matchLog);
  });


  router.post("/getUserData", async (req, res, next) => {
    await getUserData(req, res, User, matchLog, searcherPreferences, providerPreferences);
  });

  router.post("/updateUserData", async (req, res, next) => {
    await updateUserData(req, res, User, matchLog, searcherPreferences, providerPreferences);
  });
  
router.get("*", function (req, res, next) {
    //checking if user is logged on get ! -> redirect 

  try {
    if (req.query.flatlinkAuth) {
      if (
        uuid.validate(
          jwt.verify(req.query.flatlinkAuth, process.env.jwtSecret).data.id
        )
      )
        return next();
      return res.redirect("/");
    }
    if (!req.query.flatlinkAuth) {
      return res.redirect("/");
    }
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

module.exports = router;
