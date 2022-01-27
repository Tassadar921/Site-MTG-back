const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'paul.lecuisinier@gmail.com',
    pass: 'Newton32.'
  }
});

const mailOptions = {
  from: 'paul.lecuisinier@gmail.com',
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
