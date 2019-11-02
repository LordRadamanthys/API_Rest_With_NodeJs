const path = require('path')
const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')

const { host, port, user, pass } = require('../config/mail.json')

var transport = nodemailer.createTransport({
    host,
    port,
    auth: { user, pass }
});


transport.use('compile', hbs({

    viewEngine: {
        layoutsDir: './src/resources/mail/auth',
        defaultLayout: 'forgot_password',
        partialsDir: '/src/resources/mail',
        extname: '.handlebars',
    },
    viewPath: path.resolve("./", "./src/resources/mail/"),
    extname: '.hbs',
}))


module.exports = transport