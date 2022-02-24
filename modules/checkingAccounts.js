const crypto = require('crypto');
const moment = require('moment');

function ash(str) {
  return crypto.createHash('sha256')
      .update(str, 'utf-8')
      .digest('hex');
}

module.exports.signUp= function (nom, pass, email, id, con, res){
  con.query('INSERT INTO users (username, password, email, id) VALUES ?', [nom, ash(pass), email, id], (err, result) => {
    if (err) {
      throw err;
    } else {
      res.json({message: 'Account created', return: true});
    }
  });
};

module.exports.login= function (name, password, req, con, res){
  let state='';
  let exists=false;
  let connected=false;
  con.query('SELECT password FROM users WHERE username = ? OR email = ?', [name, name],(err, result)=>{
    if(err){
      throw err;
    }else{
      if(result.length){
        if(result[0].password===ash(password)){
          exists=true;
          connected=true;
          state='Connected';
          req.session.username=name;
        }else{
          if(result[0].password!==ash(password)){
            state='Password incorrect';
            exists=true;
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

module.exports.resetPassword=function(uuid, password, con, res){
  console.log(uuid);
  console.log(password);

      con.query('UPDATE users SET password = ? WHERE id = ?', [ash(password), uuid], (err, result) => {
        if(err){
          throw err;
        }else{
          res.json({message: 'Password successfully replaced', output:1});
        }
      });
}

module.exports.getUserIdByUsername = function (name, con, res) {
  con.query('SELECT id FROM users WHERE username = ?',[name], (err, result) => {
    if (err) {
      throw err;
    } else {
      console.log(result);
        if(result.length) {
          res.json({message: 'ID caught', id: result[0].id});
        }else {
          res.json({message: 'Something went wrong : retry'});
        }
      }
  });
}

module.exports.getUserList = function (con, res) {
  const tab = [];
  con.query('SELECT username, lastConnected FROM users', (err, result) => {
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

module.exports.addFriend = function (user, adding, con, res) {
  con.query('SELECT user1, user2 FROM userfriends WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)', [user, adding, adding, user], (err, re) => {
    if (err) {
      throw err;
    } else {
      if(!re) {
        con.query("INSERT INTO userfriends (user1, user2) VALUES " + "(\'" + user + "\', \'" + adding + "\')", (e, r) => {
          if (e) {
            throw e;
          }
        });
      }
    }
  });
}