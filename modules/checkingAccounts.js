const fs = require('fs');
const path = process.cwd()+'\\data\\accounts.json';

module.exports.signIn= async function (name, password, mail, res){
  const json=require(path);
  let output='';
  fs.access('../data/accounts.json', fs.constants.R_OK, function (err) {
    if(err){

      for(const line of json){
        if(line.name===name){
          output = 'Utilisateur déjà existant';
        }else{
          if(line.mail===mail){
            output = 'Adresse mail déjà utilisée';
          }
        }
      }
      if (output === '') {
        json.unshift({name: name, password: password, mail: mail});
        fs.writeFile(path, JSON.stringify(json, null, 2), function (err) {});
        output = 'Utilisateur créé';
      }
    }else
    {
      output = 'Base de donnée inexistante';
    }
    res.json({status:200, message:output});
  });
}

module.exports.login= async function (name, password, res){
  const json=require(path);
  let output='';
  let exists=false;
  let connected=false;
  fs.access('../data/accounts.json', fs.constants.R_OK, function (err) {
    if(err){

      for(const line of json) {
        if(line.name===name && line.password===password){
          exists=true;
          connected=true;
        }else{
          if(line.name===name && line.password!==password){
            output='Mot de passe incorrect';
            exists=true;
          }
        }
      }
      if(exists===false){
        output='Compte introuvable';
      }
    }else{
      output = 'Base de donnée inexistante';
    }
    res.json({status:200, message:output, co:connected});
  });
}
