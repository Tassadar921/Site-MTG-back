const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');

const account = require('./modules/checkingAccounts.js');
const mail = require('./modules/sendMail');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());

app.post('/mailToken', function(req,res){
  mail.sendToken(res, req.body.mail, req.body.name);
});

app.post('/token', function(req,res){
  mail.checkToken(res, req.body);
});

app.post('/resetPassword', function(req,res){
  mail.resetPassword(res, req.body.mail);
});

app.post('/signUp', function (req, res) {
  account.signUp(req.body.name, req.body.password, req.body.mail, res);
});

app.post('/login', function (req, res) {
  account.login(req.body.name, req.body.password, res);
});

if(app.listen(process.env.PORT || 8080)){
  console.log('Serveur lancé sur le port 8080');
}
