const crypto = require('crypto');

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

module.exports.login= function (name, password, con, res){
  let state='';
  let exists=false;
  let connected=false;
  con.query('SELECT * FROM users', (err, result)=>{
    if(err){
      throw err;
    }else{
      for(const line of result) {
        if((line.username===name || line.email===name) && line.password===ash(password)){
          exists=true;
          connected=true;
          state='Connected';
        }else{
          if((line.username===name || line.email===name) && line.password!==ash(password)){
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
          // console.log('result i : ', result[i]);
          res.json({id: line.id});
          break;
        }
        res.json({message: 'Il y a un problème dans l\'url : veuillez recommencer le processus'});
      }
    }
  });
}
