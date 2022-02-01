const fs = require('fs');
const path = process.cwd()+'/data/accounts.json';

module.exports.signUp= function (name, password, mail, res){
  const json=require(path);
  let output='';
  let created=0;
  fs.access('../data/accounts.json', fs.constants.R_OK, function (err) {
    if(err){

      if (output === '') {
        json.unshift({name: name, password: password, mail: mail});
        fs.writeFile(path, JSON.stringify(json, null, 2), function (err) {});
        output = 'Utilisateur créé';
        created=1;
      }
    }else
    {
      output = 'Base de donnée inexistante';
    }
    res.json({message:output, return: created});
  });
};

module.exports.login= function (name, password, res){
  const json=require(path);
  let output='';
  let exists=false;
  let connected=false;
  fs.access('../data/accounts.json', fs.constants.R_OK, function (err) {
    if(err){

      for(const line of json) {
        if((line.name===name || line.mail===name) && line.password===password){
          exists=true;
          connected=true;
          output='Connecté';
          console.log('name et pass ok');
        }else{
          if((line.name===name || line.mail===name) && line.password!==password){
            output='Mot de passe incorrect';
            exists=true;
            console.log('name ok mais pas pass');
          }
        }
      }
      if(exists===false){
        console.log('name introuvable');
        output='Compte introuvable';
      }
    }else{
      output = 'Base de donnée inexistante';
    }
    res.json({message:output, co:connected});
  });
}
