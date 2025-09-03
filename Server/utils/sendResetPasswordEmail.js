const sendEmail = require('./sendEmail');

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
  const resetURL = `${origin}/reset-password?token=${token}&email=${email}`;
  const message = `
    <h2>Hello ${name}</h2>
    <p>Please reset your password by clicking on the following link:</p>
    <a href="${resetURL}" clicktracking=off>${resetURL}</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you did not request a password reset, please ignore this email.</p>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Password - CampusConnect',
    html: `<h4>Reset Password</h4>${message}`,
  });
};

module.exports = sendResetPasswordEmail;