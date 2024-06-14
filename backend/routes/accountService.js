var express = require('express');
var router = express.Router();
const { User, searcherPreferences, providerPreferences }= require('../database/models');
const { login } = require('../services/authentication');
const { loginBouncer, signupBouncer } = require('../services/bouncer');
const { signup } = require('../services/signup');
const { accountData } = require('../services/userData');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

router.post('/login', loginBouncer.block, async(req, res, next) =>{
  await login(req, res, User)
});


router.post('/signup', signupBouncer.block, async (req, res) => {
  await signup(req,res,User,searcherPreferences,providerPreferences)
})


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

router.post('/accountData', async (req, res) => {
  await accountData(req,res,User,searcherPreferences,providerPreferences)
})

module.exports = router;
