const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodemailerConfig');

const sendEmail = async ({ to, subject, html }) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport(nodemailerConfig);

  return transporter.sendMail({
    from: process.env.SENDER_EMAIL, 
    to,
    subject,
    html,
  }, (error, info)=>{
    console.log(error)
  });
};

module.exports = sendEmail;
