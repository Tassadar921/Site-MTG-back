const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'mangeprout69@aol.com',
    pass: 'cacadetruire'
  }
});

const mailOptions = {
  from: 'mangeprout69@aol.com',
  to: 'paul.lecuisinier@gmail.com',
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

module.exports.send = function() {
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
