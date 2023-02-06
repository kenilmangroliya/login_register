
var jwtstrategy = require("passport-jwt").Strategy
var Extractjwt = require('passport-jwt').ExtractJwt

var usermodel = require('../model/schema');
var passport = require('passport');

var params = {}
params.jwtFromRequest = Extractjwt.fromAuthHeaderAsBearerToken()
params.secretOrKey = process.env.SECRET_KEY
// console.log(params.secretOrKey);

passport.use(new jwtstrategy(params, function (jwt_payload, done) {
    console.log(jwt_payload);

    console.log('----------------passport----------------------');
    console.log('jwt_payload._id -------->', jwt_payload._id);         //undefined           
    console.log('jwt_payload.id -------->', jwt_payload.id);

    usermodel.findOne({ _id: jwt_payload._id }, function (err, user) {
        if (err) {
            return done(err, false)
        }
        // console.log('user --------> ', user);
        if (user) {
            const userdata = { user }
            return done(null, userdata)
        }
        else {
            return done(null, false);
        }
    })
})
)
