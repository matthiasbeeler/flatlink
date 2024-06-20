var express = require('express');
var router = express.Router();
const { User, searcherPreferences, providerPreferences }= require('../database/models');
const { login } = require('../services/authentication');
const { loginBouncer, signupBouncer } = require('../services/bouncer');
const { signup } = require('../services/signup');
const { accountData } = require('../services/userData');
const uuid = require('uuid');
const { validate } = require("uuid");
const jwt = require('jsonwebtoken');
const fs = require('fs')

router.post('/login', loginBouncer.block, async(req, res, next) =>{
  await login(req, res, User)
});


router.post('/signup', signupBouncer.block, async (req, res) => {
  await signup(req,res,User,searcherPreferences,providerPreferences)
})


router.post("*", function (req, res, next) {

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

router.get("*", function (req, res, next) {
  try {
    if(req.query.flatlinkAuth){
      if(uuid.validate(jwt.verify(req.query.flatlinkAuth, process.env.jwtSecret).data.id)) return next();
      return res.redirect('/')
    }
    if(!req.query.flatlinkAuth){
      return res.redirect('/')
    }
  } catch (error) {
    console.log(error)
    return res.redirect('/')
  }
})

router.post('/accountData', async (req, res) => {
  await accountData(req,res,User,searcherPreferences,providerPreferences)
})


router.get("/uploads/searcherImages/:id", function (req, res, next) {
  try {
    var imagePath;
    if (
      validate(req.params.id)
    ) {
      imagePath = req.params.id+".webp";
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




module.exports = router;
