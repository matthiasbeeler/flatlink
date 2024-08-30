var nodemailer = require("nodemailer");
var ejs = require("ejs");
var jwt = require("jsonwebtoken");
const transporter = nodemailer.createTransport({
  host: "mail.nyv.ch",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.emailUser, // generated ethereal user
    pass: process.env.emailPassword, // generated ethereal password
  },
});

exports.singupSuccessEmail = function(email, firstName, userId, type){
    try {
      var templateName = "signupSuccessSearcher"
      if(type == "IchhabeeinZimmer") templateName = "signupSuccessProvider";
        const verificationToken = jwt.sign({data:{id: userId, email: email}}, process.env.jwtSecret, {expiresIn: '1h'});
      const filename = process.cwd() + "/emailTemplates/"+templateName+".ejs";
    ejs.renderFile(filename,{firstName: firstName, verificationUrl: process.env.appUrl+"/verifyEmail?token="+verificationToken}, (error, mailHTML) => {
      const mailOptions = {
        from: process.env.emailUserName, // Sender address
        to: email, // List of recipients //email
        subject: "flatlink", // Subject line
        html: mailHTML,
        text: "Willkommen bei flatlink. Mit folgendem Link, verifizierst Du Deine eMail Adresse: "+process.env.appUrl+"/verifyEmail?token="+verificationToken
      };
      transporter.sendMail(mailOptions, (err, response) => {
          if (!err) {
            return true
          }else{
              console.log(err)
            return false
          }
        });
    });
    
  } catch (error) {
      console.log(error)
      return false
  }
  }



  exports.emailAddressUpdate = function(email, firstName, userId){
    try {
        const verificationToken = jwt.sign({data:{id: userId, email: email}}, process.env.jwtSecret, {expiresIn: '1h'});
      const filename = process.cwd() + "/emailTemplates/emailAddressUpdate.ejs";
    ejs.renderFile(filename,{firstName: firstName, verificationUrl: process.env.appUrl+"/verifyEmail?token="+verificationToken}, (error, mailHTML) => {
      const mailOptions = {
        from: process.env.emailUserName, // Sender address
        to: email, // List of recipients //email
        subject: "flatlink eMail Update", // Subject line
        html: mailHTML,
        text: "Deine neue eMail Adresse. Mit folgendem Link verifizierst Du sie: "+process.env.appUrl+"/verifyEmail?token="+verificationToken
      };
      transporter.sendMail(mailOptions, (err, response) => {
          if (!err) {
            return true
          }else{
              console.log(err)
            return false
          }
        });
    });
    
  } catch (error) {
      console.log(error)
      return false
  }
  }


  exports.passwordForgottenEmail = function(email, userId){
    try {
        const verificationToken = jwt.sign({data:{id: userId, email: email, type: "password"}}, process.env.jwtSecret, {expiresIn: '1h'});
      const filename = process.cwd() + "/emailTemplates/passwordForgotten.ejs";
    ejs.renderFile(filename,{verificationUrl: process.env.appUrl+"/resetPassword?token="+verificationToken}, (error, mailHTML) => {
      const mailOptions = {
        from: process.env.emailUserName, // Sender address
        to: email, // List of recipients //email
        subject: "flatlink Passwort vergessen?", // Subject line
        html: mailHTML,
        text: "Passwort vergessen? Mit folgendem Link setzt Du es zurück: "+process.env.appUrl+"/resetPassword?token="+verificationToken
      };
      transporter.sendMail(mailOptions, (err, response) => {
          if (!err) {
            return true
          }else{
              console.log(err)
            return false
          }
        });
    });
    
  } catch (error) {
      console.log(error)
      return false
  }
  }

