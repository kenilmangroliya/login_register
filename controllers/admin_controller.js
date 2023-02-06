const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()


var usermodel = require('../model/schema');

//--------------------------------------------------------------------ADMIN REGISTER
(async function defaltadminsignup(req, res) {
    try {
        const admindata = {
            name: "admin",
            email: "admin@gmail.com",
            password: "admin@123"
        };

        const exiting_admin = await usermodel.findOne({ email: admindata.email })
        if (exiting_admin) {
            // console.log('admin already in database');       //check admin
            return
        }

        const userdata = new usermodel({
            ...admindata,
            // email: await bcrypt.hash(admindata.email, 10),
            password: await bcrypt.hash(admindata.password, 10)
        })

        // console.log(userdata);


        userdata.save();
        return

    }
    catch (err) {
        return res.send(err.message)
    }
})();


//--------------------------------------------------------------------ADMIN LOGIN
async function verify_login(req, res) {
    console.log('-------------ADMIN LOGIN-------------');

    var { email, password } = req.body
    if (!email || !password) {
        return res.status(401).json({
            message: "Please provide email and password"
        })
    }
    try {

        // const admindata = req.body;
        var user = await usermodel.findOne({ email: req.body.email });
        // console.log(user.password);
        // console.log(password);        //req.body.password
        // console.log(user._id);

        bcrypt.compare(password, user.password, async function (err, result) {
            if (result == true) {

                var token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY)

                return res.status(201).json({
                    message: "Admin Login Successful",
                    token,
                })
            }
            else {
                return res.status(401).json({
                    message: "password incorrect"
                })
            }

        })
    }
    catch (error) {
        return res.status(401).json({
            status: "Please valid email address",
            message: error.message
        });
    }
}


//alldata show
async function allusers(req, res) {
    const alldata = await usermodel.find()
    res.status(201).json(
        alldata
    )
}

// deletedata

module.exports = {
    verify_login,
    allusers
};


