const app = require('express')();
const bodyParser = require('body-parser');
const logger = require('morgan');
const methodOverride = require('method-override');
const cors = require('cors');
const mysql = require('mysql');

const session=require('express-session')({
  secret:"test",
  resave: true,
  saveUninitialized: true,
  cookie:{
    maxAge: 2*60*60*1000,
    secure:false
  }
});

const account = require('./modules/checkingAccounts.js');
const mail = require('./modules/sendMail');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(cors());

if(app.get('env')==='production'){
  app.set('trust proxy', 1);
  session.cookie.secure=true;
}

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password:'',
  database: 'test'
});

con.connect(err=>{
  let op;
  if(err){
    throw err;
  }else{
    console.log('Connexion effectuée');

    app.post('/signUp', function (req, res) {
      account.signUp(req.body.name, req.body.password, req.body.mail, con, res);
    });

    app.post('/login', function (req, res) {
      account.login(req.body.name, req.body.password, con, res);
    });

    app.post('/mailToken', function(req,res){
      mail.sendToken(req.body.mail, req.body.name, con, res);
    });

  }
});

app.post('/token', function(req,res){
  mail.checkToken(res, req.body);
});

app.post('/resetPassword', function(req,res){
  mail.resetPassword(res, req.body.mail);
});

if(app.listen(process.env.PORT || 8080)){
  console.log('Serveur lancé sur le port 8080');
}
