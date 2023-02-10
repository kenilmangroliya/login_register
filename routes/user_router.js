var express = require('express');
var router = express.Router();


const usercontroller = require('../controllers/user_controller');
const taskcontroller = require('../controllers/task_controller');
require('dotenv').config()

var { authuser } = require('../middlewares/verify_token')
const upload_img = require('../middlewares/upload');


router.post('/regi', upload_img, usercontroller.register);    //register

router.get('/verify_otp', usercontroller.verify_otp);    //verification email

router.put('/resend_otp', usercontroller.resend_otp);    // resend_otp

router.post('/login', usercontroller.login);      //login

router.post('/forgot_password', usercontroller.forgot_password);      //forgot_password   send mail

router.get('/reset_password', usercontroller.reset_password);      //reset_password

router.get('/list', authuser, usercontroller.list);      //list 

router.put('/update/:id', authuser, usercontroller.update);      //update

router.get('/delete/:id', usercontroller.deletedata);        //delete

router.put('/updateimg/:id', upload_img, usercontroller.updateimg);      //update



//tasks
router.post('/tasks', authuser, taskcontroller.task);

router.put('/tasks/update/:id', authuser, taskcontroller.update);     //update

router.get('/tasks/find/:id', authuser, taskcontroller.find);        //find


module.exports = router;
