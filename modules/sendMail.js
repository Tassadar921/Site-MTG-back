const nodemailer = require('nodemailer');
let token = [];

let message_temp;
let output_temp;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'noreply.tassadar.ovh@gmail.com',
        pass: 'Newton32.'
    }
});

const mailOptions = {
    from: 'noreply.tassadar.ovh@gmail.com',
    to: '',
    subject: '',
    text: ''
};

getTokenIdByMail = (mail) => {
    if(mail.length!==0) {
        for (let i = 0; i < token.length; i++) {
            if (token[i].mail === mail) {
                return i
            }
        }
    }
    return -1;
};

getTokenIdByToken = (tok) => {
    if(mail.length!==0) {
        for (let i = 0; i < token.length; i++) {
            if (token[i].token === tok) {
                return i
            }
        }
    }
};

module.exports.sendToken = function (res, mail, name) {
    let mexists=0;
    let nexists=0;
    const json=require('../data/accounts.json');

    for(const line of json){
        if(line.name===name){
            nexists=1;
        }else{
            if(line.mail===mail){
                mexists=1;
            }
        }
    }

    if(nexists===0 && mexists===0) {

        data = {
            token: Math.floor(Math.random() * 1000000000000000),
            mail: mail
        }
        token.push(data);

        mailOptions.to = mail;
        mailOptions.text = 'Here\'s your code, to paste in the token area : ' + token[getTokenIdByMail(mail)].token;
        mailOptions.subject = 'Account creation';

        transporter.sendMail(mailOptions, function (error) {
            if (error) {
                message_temp = 'Error: mail invalide';
                output_temp = 0;
                //res.json({message: 'Error: mail invalide', output: 0});
            } else {
                message_temp = 'Check your mails (maybe in the spams)';
                output_temp = 1;
                //res.json({message: 'Check your mails (maybe in the spams)', output: 1});
            }
        });
    }else{
        if(nexists===1){
            message_temp = 'Username already used';
            output_temp = 0;
            //res.json({message: 'Username already used', output: 0});
        }else{
            if(mexists===1){
                message_temp='Email adress already used';
                output_temp= 0;
                //res.json({message:'Email adress already used', output: 0});
            }
        }
    }


    res.json({message: message_temp, output: output_temp});
}

module.exports.resetPassword = function (res, mail) {
    const json = require(process.cwd() + '/data/accounts.json');
    for (const line of json) {
        if (line.mail === mail) {

            mailOptions.to = line.mail;
            mailOptions.text = 'Here\'s your password : ' + line.password;
            mailOptions.subject = 'Remember your password';

            transporter.sendMail(mailOptions, function (error) {
                if (error) {
                    message_temp= 'Error: mail invalide';
                    output_temp= 0;
                    //res.json({message: 'Error: mail invalide', output: 0});
                } else {
                    message_temp='Check your mails (maybe in the spams)';
                    output_temp=1;
                    //res.json({message: 'Check your mails (maybe in the spams)', output: 1});
                }
            });

        }
        if (mailOptions.to === '') {
            message_temp='Email missing from database';
            output_temp = 0;
            //res.json({message: 'Email missing from database'})
        }
    }
    res.json({message: message_temp, output: output_temp});
}

clearToken= function(mail, k){
  for(let i=k;i<token.length;i++){
    if(token[i].mail===mail){
      delete token[i];
    }
  }
};

module.exports.checkToken = function (res, input) {
    for (let i = 0; i < token.length; i++) {
        if (token[i].token == input.token) {
            clearToken(input.mail, i);
            message_temp = 'Token validé';
            output_temp= 1;
            //res.json({output: 1, message: 'Token validé'});
        } else {
            message_temp= 'Token invalide';
            output_temp= 0;
            //res.json({output: 0, message: 'Token invalide'});
        }
    }
    
    res.json({message: message_temp, output: output_temp});
};


