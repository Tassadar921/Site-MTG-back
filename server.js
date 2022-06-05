const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const mysql = require('mysql');
const axios = require('axios');

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
const deck = require ('./modules/decks&SQL');
const scryfall = require('./modules/scryfall');

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
            console.log('Connexion effectuée');

            app.post('/signUp', function (req, res) {
                account.signUp(req.body.name, req.body.password, req.body.mail, req.session.id, con, res);
            });

            app.post('/resetPassword', function (req, res) {
                account.resetPassword(req.body.id, req.body.password, con, res);
            });

            app.post('/getUserIdByUsername', function (req, res) {
                account.getUserIdByUsername(req.body.name, con, res);
            });

            app.post('/mailToken', function (req, res) {
                mail.sendToken(req.body.mail, req.body.name, req.body.password, con, req.session.id, res);
            });

            app.post('/checkToken', function (req, res) {
                mail.checkToken(req.body.mail, req.body.token, res);
            });

            app.post('/sendResetPassword', function (req, res) {
                mail.resetPassword(req.body.mail, req.session.id, con, res);
            });

            app.post('/login', function (req, res) {
                account.login(req.body.name, req.body.password, req, con, res);
            });

            app.post('/getUserListExceptOne', function (req, res) {
                account.getUserListExceptOne(req.body.name, con, res);
            });

            app.post('/lastConnected', function (req, res) {
                account.lastConnected(req.body.name, con, res);
            });

            app.post('/addFriend', function (req, res) {
                account.addFriend(req.body.user1, req.body.user2, con, res);
            });

            app.post('/getUserFriends', function (req, res) {
                account.getUserFriends(req.body.name, con, res);
            });

            app.post('/askFriend', function (req, res) {
                account.askFriend(req.body.from, req.body.to, con, res);
            });

            app.post('/getUserDemandsSent', function (req, res) {
                account.getUserDemandsSent(req.body.name, con, res);
            });

            app.post('/getUserDemandsReceived', function (req, res) {
                account.getUserDemandsReceived(req.body.name, con, res);
            });

            app.post('/deleteFriendship', function (req, res) {
                account.deleteFriendship(req.body.username1, req.body.username2, con, res);
            });

            app.post('/deleteDemand', function (req, res) {
                account.deleteDemand(req.body.name, req.body.owner, req.body.list, req.body.public, con, res);
            });

            app.post('/uploadDeck', function (req, res) {
                deck.uploadDeck(req.body.name, req.body.owner, req.body.list , req.body.public, req.body.colors, con, res);
            });

            app.post('/getUserDecks', function (req, res) {
                deck.getUserDecks(req.body.username, req.body.platform, con, res);
            });

            app.post('/deleteDeck', function (req, res) {
                deck.deleteDeck(req.body.username, req.body.name, con, res);
            });

            app.post('/shareDeckWith', function (req, res) {
                deck.shareWith(req.body.id, req.body.with, req.body.owner, con, res);
            });

            app.post('/getListSharedWith', function (req, res) {
                deck.getListSharedWith(req.body.id, con, res);
            });

            app.post('/getDeckListSharedWith', function (req, res) {
                deck.getDeckListSharedWith(req.body.username, req.body.platform, con, res);
            });

            app.post('/getVisibleDecks', function (req, res) {
                deck.getVisibleDecks(req.body.username, req.body.platform, con, res);
            });

            app.post('/getDeck', function (req, res) {
                deck.getDeck(req.body.username, req.body.id, con, res);
            });
        }
    });

    con.on('error', function (err) {
        console.log('db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
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
