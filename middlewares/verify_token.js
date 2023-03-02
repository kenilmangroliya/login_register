const passport = require('passport');

//USER AUTHENTICATION
function authuser(req, res, next) {
    console.log('-------------------------authuser---------------------');
    passport.authenticate('jwt', { session: false }, function (err, userdata) {
        try {
            if (err) {
                console.log(err);
                return res.status(201).json({
                    status: "invalid token"
                })
            }

            console.log('userdata --->', userdata);
            req.user = userdata.user;
            return next()

        } catch (error) {
            console.log("error from user middleware", error);
            return next()
        }
    })(req, res, next);
}


//ADMIN AUTHENTICATION
function authadmin(req, res, next) {
    console.log('-------------------------authuser---------------------');
    passport.authenticate('jwt', { session: false }, function (err, userdata) {
        try {
            if (err || userdata === false) {
                console.log(err);
                return res.status(201).json({
                    status: "invalid token"
                })
            }

            console.log('userdata --->', userdata);
            req.user = userdata.user;
            return next()

        } catch (error) {
            console.log("error from user middleware", error);
            return next()
        }
    })(req, res, next);
}

module.exports = {
    authuser,
    authadmin
}
