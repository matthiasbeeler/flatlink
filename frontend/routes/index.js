var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/components', function(req, res, next) {
  res.render('components');
});

module.exports = router;
