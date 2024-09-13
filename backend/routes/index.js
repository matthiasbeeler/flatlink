var express = require('express');
var router = express.Router();
const database = require('../database/models');
const { singupSuccessEmail } = require('../services/mailer');
database.sequelize.sync().then(() =>{
})

/* giving out 404 upon get */
router.get('*', function(req, res, next) {
  res.sendStatus(404)
});



module.exports = router;
