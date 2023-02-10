const nodemailer = require('nodemailer');
const path = require('path');

const hbs = require('nodemailer-express-handlebars')

async function otp_email(data, res) {

    var transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: 'kenilmangroliya18@gmail.com',
                pass: 'vyyxrbisvczzgyvb'
            }
        }
    );

    // point to the template folder
    const handlebarOptions = {
        viewEngine: {
            partialsDir: path.resolve('./views/'),
            defaultLayout: false,
        },
        viewPath: path.resolve('./views/'),
    };

    // use a template file with nodemailer
    transporter.use('compile', hbs(handlebarOptions))


    var mailOptions = {
        from: '<kenilmangroliya18@gmail.com>',
        to: data.email,
        subject: 'Welcome!',
        template: 'email', // the name of the template file i.e email.handlebars
        context: {
            name: data.name,
            otp: data.otp
        }
    };

    // trigger the sending of the E-mail
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('mail send success');
    });
}

//--------------------------------------SEND RESET PASSWORD MAIL------------------------------------------

async function send_reset_password_mail(name, email, token) {             //data = user      // data = find_email_otp 
    var transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: true,
        service: 'gmail',
        auth: {
            user: "kenilmangroliya18@gmail.com",
            pass: "vyyxrbisvczzgyvb"
        }
    });

    let mail_obj = ({
        from: "kenilmangroliya18@gmail.com",
        to: email,
        subject: "for reset password",
        html: `<p> hii ${name}, please copy the link and <a href = "http://localhost:3000/reset_password?token=${token}" >reset your password </a>`
    })

    transporter.sendMail(mail_obj, function (err, info) {
        if (err) {
            console.log("error", err);
        }
        else {
            console.log("mail has been send");
        }
    })
}


module.exports = {
    otp_email,
    send_reset_password_mail
}