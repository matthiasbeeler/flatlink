var express = require('express');
var router = express.Router();
const { User, providerPreferences }= require('../database/models');
const { login } = require('../services/authentication');
const { loginBouncer, signupBouncer } = require('../services/bouncer');
const { signup } = require('../services/signup');
const { searcherPreference } = require('../database/models/searcherPreference');

router.post('/login', loginBouncer.block, async(req, res, next) =>{
  await login(req, res, User)
});


router.post('/signup', signupBouncer.block, async (req, res) => {
  await signup(req,res,User,searcherPreference,providerPreferences)
})




module.exports = router;
