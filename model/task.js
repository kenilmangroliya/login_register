const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    subject: {
        type: String
    },
    description: {
        type: String
    },
    date: {
        type: Date
    },
    status: {
        type: String
    },
    owner:{
        type:String
    }
});

const task = mongoose.model("task", schema);

module.exports = task;