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
const { getStartStats } = require("../services/adminData");




router.all("*", function (req, res, next) {
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

router.get("*", function (req, res, next) {
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

router.post("/accountData", async (req, res) => {
  await accountData(req, res, User, searcherPreferences, providerPreferences);
});

router.post("/getAllData", async (req, res) => {
  await allData(req, res, User, searcherPreferences, providerPreferences);
});



router.post("/updateAccount", async (req, res) => {
  if (req.body.type == "phonenumber")
    return await updatePhonenumber(req, res, User);
  
  if (req.body.type == "email") return await updateEmail(req, res, User);

  if (req.body.type == "job")
    return await updateJob(req, res, searcherPreferences);

  if (req.body.type == "password") return await updatePassword(req, res, User);

  if (req.body.type == "profileImage")
    return await updateProfileImage(req, res, User);
});


router.get("/uploads/searcherImages/:id", function (req, res, next) {
  try {
    var imagePath;
    if (validate(req.params.id)) {
      imagePath = req.params.id + ".webp";
    } else {
      imagePath = "0";
    }
    fs.readFile(
      process.cwd() + "/uploads/searcherImages/" + imagePath,
      (err, data) => {
        if (!err && data) {
          return res.sendFile(
            process.cwd() + "/uploads/searcherImages/" + imagePath
          );
        } else {
          return res.sendFile(process.cwd() + "/assets/accountPlaceholder.svg");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

router.get("/uploads/providerImages/:id", function (req, res, next) {
  try {
    var imagePath;
    if (validate(req.params.id)) {
      imagePath = req.params.id + ".webp";
    } else {
      imagePath = "0";
    }
    fs.readFile(
      process.cwd() + "/uploads/providerImages/" + imagePath,
      (err, data) => {
        if (!err && data) {
          return res.sendFile(
            process.cwd() + "/uploads/providerImages/" + imagePath
          );
        } else {
          return res.sendFile(process.cwd() + "/assets/noFlatImage.svg");
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
