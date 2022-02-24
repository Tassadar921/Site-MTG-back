const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const mysql = require('mysql');

const session = require("express-session")({
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

function preventDisconnect() {
    con.connect(err => {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(preventDisconnect, 5000);
        } else {
            app.post('/', (req) => {

                const info = req;
                console.log('Connexion effectuée');

                app.post('/signUp', function (req, res) {
                    account.signUp(req.body.name, req.body.password, req.body.mail, info.session.id, con, res);
                });

                app.post('/resetPassword', function (req, res) {
                    account.resetPassword(req.body.id, req.body.password, con, res);
                });

                app.post('/getUserIdByUsername', function (req, res) {
                    console.log('bouh');
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

                app.post('/login', function (req, res) {
                    account.login(req.body.name, req.body.password, req, con, res);
                });

                app.post('/getUsers', function (req, res) {
                    account.getUserList(con, res);
                });

                app.post('/lastConnected', function (req, res) {
                    account.lastConnected(req.body.name, con);
                });

                app.post('/addFriend', function(req,res){
                    account.addFriend(req.body.user, req.body.adding, con, res);
                });

                app.post('/test', function (req, res) {
                    console.log('test');
                });
            });
        }
    });

    con.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') {
            preventDisconnect();
        } else {
            throw err;
        }
    });
}

preventDisconnect();

if (app.listen(process.env.PORT || 8080)) {
    console.log('Serveur lancé sur le port 8080');
}
