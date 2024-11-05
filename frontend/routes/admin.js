var express = require('express');
var router = express.Router();
const uuid= require('uuid');
const jwt= require('jsonwebtoken');

/* GET users listing. */


router.all("*", function (req, res, next) {
  try {

  if(req.cookies.flatlinkAuth){
    if(uuid.validate(jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.id) && jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.userType == "admin") return next();
    return res.redirect('/')
  }
  if(!req.cookies.flatlinkAuth){
    return res.redirect('/')
  }
} catch (error) {
  return res.redirect('/')
}
})

router.get('/', function(req, res, next) {
  res.render('admin/home');
});


router.get('/settings', function(req, res, next) {
  res.render('admin/settingsOverview');
});

router.get('/settings/userAccounts', function(req, res, next) {
  res.render('admin/settings/userAccounts');
});

router.get('/settings/userAccounts/:userId/:userType', function(req, res, next) {
  console.log(req.params.userType)
  res.render('admin/settings/singleAccount', {userId: req.params.userId, userType: req.params.userType});
});


router.get('/account', function(req, res, next) {
  res.render('loggedin/account', {userType: jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.userType});
});


router.get('/likes', function(req, res, next) {
  res.render('loggedin/likes', {userType: jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.userType});
});


router.get('/tutorial/searcher', function(req, res, next) {
  res.render('loggedin/tutorialSearcher');
});

router.get('/account/update/:type', function(req, res, next) {
  const updateType = req.params.type;
  res.render('loggedin/account/detailUpdateGeneral', {updateType});
});

module.exports = router;
