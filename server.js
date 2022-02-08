const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const mysql = require('mysql');
const crypto = require('crypto');

const session = require("express-session")({
    // CIR2-chat encode in sha256
    secret: "eb8fcc253281389225b4f7872f2336918ddc7f689e1fc41b64d5c4f378cdc438",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 2 * 60 * 60 * 1000,
        secure: false
    }
});

const account = require('./modules/checkingAccounts.js');
const mail = require('./modules/sendMail');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());
app.use(session);

if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    session.cookie.secure = true;
}

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mtg'
});

con.connect(err => {
    if (err) {
        throw err;
    } else {
        app.post('/', (req) => {

            const info=req;
            console.log('Connexion effectuée');

            app.post('/signUp', function (req, res) {
                account.signUp(req.body.name, req.body.password, req.body.mail, info.session.id, con, res);
            });

            app.post('/login', function (req, res) {
                account.login(req.body.name, req.body.password, con, res);
            });

            app.post('/resetPassword', function (req, res) {
                account.resetPassword(req.body.id, req.body.password, con, res);
            });

            app.post('/getUserIdByUsername', function (req, res) {
                account.getUserIdByUsername(req.body.name, con, res);
            });

            app.post('/mailToken', function (req, res) {
                mail.sendToken(req.body.mail, req.body.name, req.body.password, con, info.session.id, res);
            });

            app.post('/checkToken', function (req, res) {
                mail.checkToken(req.body.mail, req.body.token, res);
            });

            app.post('/sendResetPassword', function (req, res) {
                mail.resetPassword(req.body.mail, info.session.id, con, res);
            });
        });
    }
});

if (app.listen(process.env.PORT || 8080)) {
    console.log('Serveur lancé sur le port 8080');
}
