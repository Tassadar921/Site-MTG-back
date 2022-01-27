const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');

const check = require('./modules/checkingAccounts.js');
const mail = require('./modules/sendMail');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());

app.post('/signIn', function (req, res) {
  mail.send()
  // check.signIn(req.body.name, req.body.password, req.body.mail, res);
});

app.post('/login', function (req, res) {
  check.login(req.body.name, req.body.password, res);
});

app.post('/mail', function(req,res){
  mail.send();
});

if(app.listen(process.env.PORT || 8080)){
  console.log('Serveur lancé sur le port 8080');
}
