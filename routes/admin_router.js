var express = require('express');
var router = express.Router();

// var session = require('express-session');
var usermodel = require('../model/schema');
var admin_controller = require('../controllers/admin_controller')
var { authadmin } = require('../middlewares/verify_token');

//admin login
router.post('/admin', admin_controller.verify_login);

// all user data show
router.get('/alluser', authadmin, admin_controller.allusers);


module.exports = router;
