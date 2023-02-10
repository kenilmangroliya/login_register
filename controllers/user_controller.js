require('dotenv').config()

var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const multer = require('multer');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require('path');
var randomstring = require('randomstring');

var usermodel = require('../model/schema');
var avatarpath = "/public/images/";
var { otp_email, send_reset_password_mail } = require('../Email/account')   // otp email account

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
    usermodel(user).save();

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
        { email: req.body.email },    //find email
        { otp: random_otp }           //set karva mate
    );

    // find email in database
    var find_email_otp = await usermodel.findOne({ email: req.body.email })
    if (!find_email_otp) {
        return res.status(201).json({
            status: "you are ot register"
        })
    }

    if (find_email_otp.verify_otp == false) {
        otp_email(find_email_otp);

        return res.status(201).json({
            status: "resend otp successfully"
        })
    }
    else {
        res.status(401).json({
            status: "somting went wrong"
        })
    }

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

// ---------------------------------------------FORGOT PASSWORD---------------------------------------------------

async function forgot_password(req, res) {


    var userdata = await usermodel.findOne({ email: req.body.email })
    if (userdata) {
        const random_string = randomstring.generate();
        // console.log(random_string);

        const data = await usermodel.findOneAndUpdate(
            { email: req.body.email },
            {
                $set: { token: random_string }
            })

        send_reset_password_mail(data.name, data.email, random_string)

        res.status(201).json({
            msg: "plzz check your email and reset your password"
            // data
        })
    } else {
        res.status(201).json({
            msg: "this email does not exiting"
        })
    }
}

// ---------------------------------------------reset PASSWORD---------------------------------------------------

async function reset_password(req, res) {
    try {

        const token = req.query.token
        // console.log(token)

        var find_token = await usermodel.findOne({ token: token })
        if (find_token) {
            const password = req.body.password
            const confirm_password = req.body.confirm_password

            if (password == confirm_password) {
                var bpass = await bcrypt.hash(password, 10)                          //bcrypt password

                const update_pass = await usermodel.findByIdAndUpdate(
                    { _id: find_token._id },
                    { $set: { password: bpass, token: "" } },
                    { new: true }
                )
                return res.status(201).json({
                    msg: "user password has been reset",
                    update_pass
                })
            }
            else {
                return res.status(400).json({
                    msg: "password and confirm_passwrod do not match"
                })
            }

        }
        else {
            res.status(400).json({
                msg: "your link has been expired '(plzz check your query link)'"
            })
        }

    } catch (error) {
        res.status(400).json({
            msg: "error =============>", error
        })
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
    forgot_password,
    reset_password,
    list,
    update,
    deletedata,
    updateimg
}