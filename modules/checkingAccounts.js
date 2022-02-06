module.exports.signUp= function (nom, pass, email, id, con, res){
  let insertVar=[[nom, pass, email, id]];
  let insert = 'INSERT INTO users (username, password, email, id) VALUES ?';
  con.query(insert, [insertVar], (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.json({message: 'Utilisateur créé', return: true});
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
        if((line.username===name || line.email===name) && line.password===password){
          exists=true;
          connected=true;
          state='Connecté';
        }else{
          if((line.username===name || line.email===name) && line.password!==password){
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
