const nodemailer = require('nodemailer');
let token = [];

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
    if (mail.length !== 0) {
        for (let i = 0; i < token.length; i++) {
            if (token[i].mail) {
                if (token[i].mail === mail) {
                    return i
                }
            }
        }
    }
    return -1;
};

getTokenIdByToken = (tok) => {
    if (mail.length !== 0) {
        for (let i = 0; i < token.length; i++) {
            if (token[i].token === tok) {
                return i
            }
        }
    }
};

clearToken = function (mail, k) {
    for (let i = k; i < token.length; i++) {
        if (token[i].mail === mail) {
            token.splice(i, 1);
        }
    }
};

module.exports.sendToken = function (mail, name, con, res) {
    let mexists = 0;
    let nexists = 0;

    con.query('SELECT * FROM users', (err, result) => {
        if (err) {
            throw err
        } else {
            for (const line of result) {
                if (line.username === name) {
                    nexists = 1;
                } else {
                    if (line.email === mail) {
                        mexists = 1;
                    }
                }
            }
        }

        if (nexists === 0 && mexists === 0) {

            data = {
                token: Math.floor(Math.random() * 1000000000000000),
                mail: mail
            }

            clearToken(mail, 0);
            token.push(data);

            mailOptions.to = mail;
            mailOptions.text = 'Here\'s your code, to paste in the token area : ' + token[getTokenIdByMail(mail)].token;
            mailOptions.subject = 'Account creation';

            transporter.sendMail(mailOptions, function (error) {
                if (error) {
                    res.json({message: 'Error: mail invalide', output: 0});
                } else {
                    res.json({message: 'Check your mails (maybe in the spams)', output: 1});
                }
            });
        } else {
            if (nexists === 1) {
                res.json({message: 'Username already used', output: 0});
            } else {
                if (mexists === 1) {
                    res.json({message:'Email adress already used', output: 0});
                }
            }
        }
    });
}

module.exports.resetPassword = function (mail, con, res) {
    con.query('SELECT * FROM users', (err, result) => {
        if (err) {
            throw err
        } else {
            for (const line of result) {
                if (line.email === mail) {

                    mailOptions.to = line.email;
                    mailOptions.text = 'Hello ' + line.username + ' your password is : ' + line.password;
                    mailOptions.subject = 'Remember your password';

                    transporter.sendMail(mailOptions, function (error) {
                        if (error) {
                            res.json({message: 'Email invalide', output: 0});
                        } else {
                            res.json({message: 'Check your mails (maybe in the spams)', output: 1});
                        }
                    });

                }
            }
            if (mailOptions.to === '') {
                res.json({message: 'Email missing from database'})
            }
        }
    });
}

module.exports.checkToken = function (res, input) {
    for (let i = 0; i < token.length; i++) {
        if (token[i].token == input.token) {
            clearToken(input.mail, i);
            res.json({output: 1, message: 'Token validé'});
        } else {
            res.json({output: 0, message: 'Token invalide'});
        }
    }
}


