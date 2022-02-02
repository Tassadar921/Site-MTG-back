const fs = require('fs');
const path = process.cwd()+'/data/accounts.json';

module.exports.signUp= function (name, password, mail, con, res){
  let output='';
  let created=0;

  let insert = "INSERT INTO compte (name, password, mail) VALUES (name, password, mail)";
  con.query(insert, (err, result) => {
    if (err) {
      throw err;
    } else {
      console.log(result);
      console.log('on insère :', )
      output = 'Utilisateur créé';
      created = 1;
    }
  });

  res.json({message: output, return: created});

};

module.exports.login= function (name, password, con, res){
  let state='';
  let exists=false;
  let connected=false;
  con.query('SELECT * FROM compte', (err, result)=>{
    if(err){
      throw err
    }else{
      for(const line of result) {
        if((line.name===name || line.mail===name) && line.password===password){
          exists=true;
          connected=true;
          state='Connecté';
        }else{
          if((line.name===name || line.mail===name) && line.password!==password){
            state='Mot de passe incorrect';
            exists=true;
          }
        }
      }
      if(exists===false){
        state='Compte introuvable';
      }
    }
    res.json({message: state, co: connected});
  });
}
