require('dotenv').config()

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const multer = require('multer');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');

var usermodel = require('../model/schema');
var avatarpath = "/public/images/";
var otp_email = require('../Email/account')   // otp email account

// ---------------------------------------------REGISTER---------------------------------------------------

var random_otp = `${Math.floor(Math.random() * (9999 - 9000 + 1) + 1000)}`
async function register(req, res) {

    var useremail = await usermodel.findOne({ email: req.body.email })
    if (useremail) {
        return res.status(201).json({
            status: "Email Is Already Taken"
        })
    }

    // var random_otp = `${Math.floor(Math.random() * (9999 - 9000 + 1) + 1000)}`;
    var bpass = await bcrypt.hash(req.body.password, 10)

    var user = {
        name: req.body.name,
        email: req.body.email,
        password: bpass,
        contect: req.body.contect,
        avatar: avatarpath + req.file.filename,
        otp: random_otp,
        verify_otp: false
    }
    console.log(user);

    otp_email(user)

    // usermodel(user).save();

    return res.status(201).json({
        status: "Data Saved",
        user
    })
}

// ---------------------------------------------VERIFY OTP---------------------------------------------------

async function verify_otp(req, res) {

    //  ===============> tene id database ma no male tyare
    var userdata = await usermodel.findOne({ email: req.body.email })
    if (!userdata) {
        // return res.redirect('/regi')
        return res.status(403).json({
            status: "You Are Not Registered/ (Unable To Store Data)"
        })
    }

    // ===============> user verify hoy tyare
    var existing_user = await usermodel.findOne({ email: req.body.email, verify_otp: false })
    if (!existing_user) {
        return res.status(401).json({
            status: "User Already Verified!"
        })
    }
    // userData.save();

    var new_otp = req.body.otp

    console.log(userdata.otp);
    console.log(new_otp);

    if (new_otp == userdata.otp) {

        // ===============> new_otp and existin_otp same hoy tyare
        await usermodel.findOneAndUpdate({ email: req.body.email, verify_otp: false }, { verify_otp: true, otp: 0 })
        // var old_otp = 0;
        // await usermodel.findByIdAndUpdate(req.params.id, { otp: old_otp })

        return res.status(201).json({
            status: "Registered Successfully"
        })
    }
    else {
        return res.status(201).json({
            status: "Please Valid OTP"
        })
    }
}


// ---------------------------------------------RESEND OTP---------------------------------------------------

async function resend_otp(req, res) {

    //random otp generate
    var random_otp = `${Math.floor(Math.random() * (9999 - 9000 + 1) + 1000)}`;

    //new otp update in old otp position
    var useremail = await usermodel.findOneAndUpdate(
        { email: req.body.email },
        { otp: random_otp }
    );

    //find emaIl in database
    var find_email_otp = await usermodel.findOne({ email: req.body.email })

    // send mail in email.id
    otp_email(find_email_otp);

    res.status(201).json({
        status: "resend otp successfully"
    })
}


// ---------------------------------------------LOGIN---------------------------------------------------

async function login(req, res) {

    try {
        var compare = await usermodel.findOne({ email: req.body.email })
        if (compare.verify_otp == false) {
            return res.status(201).json({
                status: "you are not verify for login because your otp not verify"
            })
        }
        // console.log(compare.password);
        // console.log(compare.email);

        bcrypt.compare(req.body.password, compare.password, function (err, result) {
            // console.log(result);
            console.log(compare.id);
            if (result == true) {

                var token = jwt.sign({ _id: compare._id }, process.env.SECRET_KEY);

                return res.status(201).json({
                    status: "Login Successfully",
                    token
                })
            }
            else {
                return res.status(201).json({
                    status: "enter valid password"
                })
            }
        })
    } catch (error) {
        res.status(402).json({
            status: "email is not valid"
        });
    }
}

// ---------------------------------------------LIST---------------------------------------------------

async function list(req, res) {
    var data = await usermodel.find({ email: req.body.email });

    res.status(201).json({
        data
    })
}

// ---------------------------------------------UPDATE---------------------------------------------------

async function update(req, res) {
    var update = await usermodel.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body }
    )

    res.status(201).json({
        status: "Update successful",
        update
    });
}

// ---------------------------------------------DELETE---------------------------------------------------

async function deletedata(req, res) {

    try {
        usermodel.findById(req.params.id, async function (err, result) {
            if (err) {
                console.log("error", err);
            }
            else {

                fs.unlinkSync(path.join(__dirname, "..", result.avatar))

                var dlt = await usermodel.findByIdAndDelete(req.params.id)
                res.status(201).json({
                    status: "delete data/img successfully",
                    dlt
                })
            }
        });
    }
    catch (error) {
        res.status(401).json({
            status: "not delete"
        });
    }
}


// ---------------------------------------------UPDATE ONLY IMAGES---------------------------------------------------

async function updateimg(req, res) {
    try {
        usermodel.findById(req.params.id, async function (err, result) {
            if (!err) {
                fs.unlinkSync(path.join(__dirname, "..", result.avatar))
            }
        })

        usermodel.findByIdAndUpdate(req.params.id, { avatar: avatarpath + req.file.filename }, function (err, result) {
            if (result) {
                return res.status(201).json({
                    status: "img update successfully"
                })
            }
            else {
                return res.status(201).json({
                    status: "img update not successfully",
                    err
                })
            }
        })

    } catch (error) {
        res.status(401).json({
            status: "not update"
        })
    }
}



module.exports = {
    register,
    verify_otp,
    resend_otp,
    login,
    list,
    update,
    deletedata,
    updateimg
}