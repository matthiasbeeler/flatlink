var express = require('express');
var router = express.Router();
const uuid= require('uuid');
const jwt= require('jsonwebtoken');

/* GET users listing. */


router.all("*", function (req, res, next) {
  try {

  if(req.cookies.flatlinkAuth){
    if(uuid.validate(jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.id)) return next();
    return res.redirect('/')
  }
  if(!req.cookies.flatlinkAuth){
    return res.redirect('/')
  }
} catch (error) {
  console.log(error)
  return res.redirect('/')
}
})

router.get('/', function(req, res, next) {
  if(jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.userType == "provider") return   res.render('loggedin/likes', {userType: jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.userType});
  res.render('loggedin/home');
});



router.get('/account', function(req, res, next) {
  res.render('loggedin/account', {userType: jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.userType});
});


router.get('/likes', function(req, res, next) {
  res.render('loggedin/likes', {userType: jwt.verify(req.cookies.flatlinkAuth, process.env.jwtSecret).data.userType});
});

router.get('/preferences', function(req, res, next) {
  res.render('loggedin/preferences');
});

router.get('/account/update/:type', function(req, res, next) {
  const updateType = req.params.type;
  res.render('loggedin/account/detailUpdateGeneral', {updateType});
});

module.exports = router;
