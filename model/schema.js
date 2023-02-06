const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    contect: {
        type: String
    },
    // role: {
    //     type: Boolean,
    //     default: "user"
    // },
    avatar: {
        type: String,
        default: 'image/png'
    },
    otp: {
        type: Number
    },
    verify_otp: {
        type: Boolean,
        default: false
    }
})

const model = mongoose.model('tenthita', schema);

module.exports = model;