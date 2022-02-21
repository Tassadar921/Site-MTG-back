const crypto = require('crypto');
const moment = require('moment');

function ash(str) {
  return crypto.createHash('sha256')
      .update(str, 'utf-8')
      .digest('hex');
}

module.exports.signUp= function (nom, pass, email, id, con, res){
  let insertVar=[[nom, ash(pass), email, id]];
  let insert = 'INSERT INTO users (username, password, email, id) VALUES ?';
  con.query(insert, [insertVar], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json({message: 'Account created', return: true});
    }
  });
};

module.exports.login= function (name, password, req, con, res){
  let state='';
  let exists=false;
  let connected=false;
  con.query('SELECT * FROM users', (err, result)=>{
    if(err){
      throw err;
    }else{
      for(let i=0; i<result.length; i++) {
        if((result[i].username===name || result[i].email===name) && result[i].password===ash(password)){
          exists=true;
          connected=true;
          state='Connected';
          req.session.username=result[i].username;
          i=result.length;
        }else{
          if((result[i].username===name || result[i].email===name) && result[i].password!==ash(password)){
            state='Password incorrect';
            exists=true;
            i=result.length;
          }
        }
      }
      if(exists===false){
        state='Account not found';
      }
    }
    res.json({message: state, co: connected});
  });
}

module.exports.resetPassword=async function(id, password, con, res){

      const sql = "UPDATE users SET password = ? WHERE id = \'" + id + "\'";
      await con.query(sql, [ash(password)], (err, result) => {
        if(err){
          throw err;
        }else{
          res.json({message: 'Password successfully replaced', output:1});
        }
      });
}

module.exports.getUserIdByUsername = function (name, con, res) {
  con.query('SELECT * FROM users', (err, result) => {
    if (err) {
      throw err;
    } else {
      for (let line of result) {
        if (line.username === name) {
          res.json({id: line.id});
          break;
        }
        res.json({message: 'Il y a un problème dans l\'url : veuillez recommencer le processus'});
      }
    }
  });
}

module.exports.getUserList = function (con, res) {
  const tab = [];
  con.query('SELECT * FROM users', (err, result) => {
    if (err){
      throw err;
    }else{
      for(let line of result){
        tab.unshift({username: line.username, lastConnected: line.lastConnected});
      }
      res.json({output: tab});
    }
  });
}

module.exports.lastConnected = function (name, con){
  let date = new Date().toLocaleDateString('fr') + ' à ';
  let hour;
  if(moment().format('h:mm:ss a').includes('pm')){
    let cut;
    for(let i = 0; i<moment().format('h:mm:ss a').length;i++){
      if(moment().format('h:mm:ss a')[i]===':'){
        cut = i;
        i=moment().format('h:mm:ss a').length;
      }
    }
    if(moment().format('h:mm:ss a')[0]==='1' && moment().format('h:mm:ss a')[1]==='2'){
      hour = ('0' + moment().format('h:mm:ss a').slice(cut, moment().format('h:mm:ss a').length-6));
    }else{
      hour = (Number(moment().format('h:mm:ss a').slice(0,cut))+12)
          .toString()+moment().format('h:mm:ss a')
          .slice(cut, moment().format('h:mm:ss a').length-6);
    }
  }else{
    hour = moment().format('h:mm:ss a')
        .slice(0, moment().format('h:mm:ss a').length-6);
  }
  date += hour;
  con.query('UPDATE users SET lastConnected = ? WHERE username = \''+ name + '\'', [date], (err, result) => {});
}