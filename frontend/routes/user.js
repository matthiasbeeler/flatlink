var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('loggedin/home');
});

router.get('/account', function(req, res, next) {
  res.render('loggedin/account');
});

module.exports = router;
