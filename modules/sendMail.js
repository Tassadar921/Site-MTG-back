const nodemailer = require('nodemailer');
let token;

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
  subject: 'Sending Email using Node.js',
  text: ''
};

module.exports.send = function(res, mail) {
  token=Math.floor(Math.random()*1000000000000000);
  mailOptions.to=mail;
  mailOptions.text='Here\'s your code, to paste in the token area : ' + token;
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      res.json({status:200, message:'Error: mail invalide', output: 0});
    } else {
      res.json({status:200, message:'Check your mails (maybe in the spams)', output: 1});
    }
  });
}

module.exports.checkToken=function(res, input){
  if(token==input.token){
    res.json({output: 1, message: 'Token validé'});
  }else{
    res.json({output: 0, message: 'Token invalide'});
  }
}
