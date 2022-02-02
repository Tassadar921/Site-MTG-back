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
    op = "INSERT INTO compte (name, password, mail) VALUES ('a', 're', 'paul.lecuisinier921@gmail.com')";
    con.query(op, (err, result)=>{
      if(err){
        throw err;
      }else{
        console.log('On a inséré : ')
        console.log(result);
      }
    });

    con.query('SELECT * FROM compte', (err, result)=>{
      if(err) throw err;
      console.log(result);
    })
  }
});

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
