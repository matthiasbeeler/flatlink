var express = require('express');
var router = express.Router();
const uuid= require('uuid');
const jwt = require('jsonwebtoken')


/* GET home page. */


router.get("/logout", (req, res) => {
  res.clearCookie("flatlinkAuth");
  console.log("Success logout")
  res.redirect("/");
});

router.all("*", function (req, res, next) {
  try {
  if(req.cookies.flatlinkAuth){
    if(uuid.validate(jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.id)) return res.redirect('/user')
    return next()
  }
  if(!req.cookies.flatlinkAuth){
    return next()
  }
} catch (error) {
    next()
    console.log(error)
}
})

router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/components', function(req, res, next) {
  res.render('components');
});

router.get('/signup/', function(req, res, next) {
  res.render('signup/start');
});

router.get('/signup/data', function(req, res, next) {
  res.render('signup/data');
});

router.get('/signup/preferences/typeOption', function(req, res, next) {
  res.render('signup/typeOption');
});

//provider
router.get('/signup/preferences/provider/', function(req, res, next) {
  res.render('signup/provider/preferencesFirst');
});
router.get('/signup/preferences/provider/second', function(req, res, next) {
  res.render('signup/provider/preferencesSecond');
});
router.get('/signup/preferences/provider/third', function(req, res, next) {
  res.render('signup/provider/preferencesThird');
});
router.get('/signup/preferences/provider/fourth', function(req, res, next) {
  res.render('signup/provider/preferencesFourth');
});
router.get('/signup/preferences/provider/profile', function(req, res, next) {
  res.render('signup/provider/profileFirst');
});


//searcher
router.get('/signup/preferences/person/', function(req, res, next) {
  res.render('signup/person/preferencesFirst');
});
router.get('/signup/preferences/person/second', function(req, res, next) {
  res.render('signup/person/preferencesSecond');
});
router.get('/signup/preferences/person/third', function(req, res, next) {
  res.render('signup/person/preferencesThird');
});
router.get('/signup/preferences/person/fourth', function(req, res, next) {
  res.render('signup/person/preferencesFourth');
});
router.get('/signup/preferences/person/profile', function(req, res, next) {
  res.render('signup/person/profileFirst');
});
module.exports = router;
