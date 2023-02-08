const { strict } = require("assert");
const mongoose = require("mongoose");
const { stringify } = require("qs");

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
    role: {
        type: String,
        default: "user"
    },
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