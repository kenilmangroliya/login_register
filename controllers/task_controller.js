

var task_model = require('../model/task');

//add data
async function task(req, res) {
    try {

        const obj = ({
            subject: req.body.subject,
            description: req.body.description,
            date: Date(req.body.date),
            status: req.body.status
        })

        task_model(obj).save();
        return res.status(201).send({
            message: 'Task created successfully',
            obj
        })
    } catch (error) {
        res.status(201).json({
            mes: "error",
            message: 'err'
        })
    }
}

//update
async function update(req, res) {


    var task_update = {
        subject: req.body.subject,
        description: req.body.description,
        date: Date(req.body.date),
        status: req.body.status
    }


    try {
        var update = await task_model.findOneAndUpdate(
            { _id: req.params.id },
            { $set: task_update }
        )
        return res.status(200).json({
            message: 'Task updated successfully',
            obj: update
        })

    } catch (error) {
        res.status(201).json({
            message: error
        })
    }
}

//find data
async function find(req, res) {
    // console.log(req.user.name);     // find passport.js in user data
    var find_data = await task_model.findById(req.params.id)

    res.status(201).json({
        message: 'successfully',
        find_data
    })
}


module.exports = {
    task,
    update,
    find
};