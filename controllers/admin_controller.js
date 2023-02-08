const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config()

const exceljs = require('exceljs');

var usermodel = require('../model/schema');
var task_model = require('../model/task');

//--------------------------------------------------------------------ADMIN REGISTER
(async function defaltadminsignup(req, res) {
    try {
        const admindata = {
            name: "admin",
            email: "admin@gmail.com",
            password: "admin@123",
            role:"admin"
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
                    message: "Admin Login Successfull",
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

//exceljs => user all data show in excel
async function exports_user(req, res) {
    try {

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("My Users");

        worksheet.columns = [
            { header: "s_no", key: "s_no", width: 10 },
            { header: "name", key: "name", width: 10 },
            { header: "email", key: "email", width: 10 },
            { header: "password", key: "password", width: 10 },
            { header: "avatar", key: "avatar", width: 10 },
            { header: "otp", key: "otp", width: 10 },
            { header: "verify_otp", key: "verify_otp", width: 10 },
        ];

        let counter = 1;

        const userdata = await usermodel.find({role:"user"})

        userdata.forEach((user) => {
            user.s_no = counter;
            worksheet.addRow(user);
            counter++;
        });

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = {
                bold: true
            };
        })

        console.log("===========>userdata", userdata);
        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        res.setHeader("Content_Disposition", "attatchment; filename=" + "users.xlsx")
        const data = workbook.xlsx.writeFile('users.xlsx')

        workbook.xlsx.write(res)
            .then(() => {
                res.status(200).end()
            })

        // ---------------------------------------------------task_data-----------------------------------------------------------

        const task_workbook = new exceljs.Workbook()
        const task_worksheet = task_workbook.addWorksheet("user task");

        task_worksheet.columns = [
            { header: "s_no", key: "s_no", width: 10 },
            { header: "subject", key: "subject", width: 10 },
            { header: "description", key: "description", width: 10 },
            { header: "date", key: "date", width: 10 },
            { header: "status", key: "status", width: 10 },
        ];

        var task_counter = 1;

        const task_userdata = await task_model.find({})

        task_userdata.forEach((task)=>{
            task.s_no = task_counter;
            task_worksheet.addRow(task)
            task_counter++;

        })

        task_worksheet.getRow(1).eachCell((cell)=>{
            cell.font = {
                bold: true
            };
        })

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
        res.setHeader("Content_Disposition", "attatchment; filename=" + "task_users.xlsx")
        const data1 = task_workbook.xlsx.writeFile('task_users.xlsx')



        return task_workbook.xlsx.write(res)
            .then(() => {
                res.status(200).end()
            })

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    verify_login,
    allusers,
    exports_user
};


