var express = require('express');
var router = express.Router();

/* GET home page. */
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

router.get('/signup/preferences/first', function(req, res, next) {
  res.render('signup/preferencesFirst');
});

router.get("/logout", (req, res) => {
  res.clearCookie("flatlinkAuth");
  res.redirect("/");
});

module.exports = router;
