const multer = require('multer');
const uesrmodel = require('../model/schema');


//diskstorage    // single img
// var file_nm;
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/')
    },
    // destination: 'images',
    filename: function (req, file, cb) {
        cb(null, file.originalname)
        // cb(null, file.fieldname + Date.now() + ".png")    --->  // img ne png ma convert karvu hoy tyare
        // console.log(file_nm);
    }
});


const upload = multer({ storage: storage }).single('avatar');

module.exports = upload;
