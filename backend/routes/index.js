var express = require('express');
var router = express.Router();
const database = require('../database/models');
const { User }= require('../database/models');
const { login } = require('../services/authentication');
database.sequelize.sync().then(() =>{
  console.log("Success")
})

/* GET home page. */
router.get('*', function(req, res, next) {
  res.sendStatus(404)
});


router.post('/login', async(req, res, next) =>{
  await login(req, res, User)

});
const bcrypt = require('bcrypt');



router.post('/register', async (req, res) => {
  const passwordHash = bcrypt.hashSync(req.body.password, 10);

})

module.exports = router;
