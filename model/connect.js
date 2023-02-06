const mongoose = require("mongoose");
// mongoose.set('debug',true);
mongoose.set('strictQuery',false);
mongoose.connect("mongodb://127.0.0.1:27017/ten",{
    useNewUrlparser:true,
    useUnifiedTopology:true,
})
.then(() => {
    console.log("DB connection successfully");
}).catch(()=>{
    console.log(err);
    console.log("DB connection is not success");
});

module.exports = mongoose;