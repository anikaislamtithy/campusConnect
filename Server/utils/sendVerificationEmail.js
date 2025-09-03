const sendEmail = require("./sendEmail");

const sendVerificationEmail = async ({
    name,
    email,
    verificationToken,
    origin,
}) => {
    const verifyEmail = `${origin}/verify-email?token=${verificationToken}&email=${email}`;

    const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - CampusConnect</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 CampusConnect</h1>
          <p>Academic Resource Sharing Platform</p>
        </div>
        <div class="content">
          <h2>Welcome to CampusConnect, ${name}!</h2>
          <p>Thank you for joining our academic resource sharing community. To complete your registration and start sharing knowledge with fellow students, please verify your email address.</p>
          
          <div style="text-align: center;">
            <a href="${verifyEmail}" class="button">Verify Email Address</a>
          </div>
          
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">${verifyEmail}</p>
          <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 4px;">Token: ${verificationToken}</p>
          
          <p><strong>What you can do with CampusConnect:</strong></p>
          <ul>
            <li>📝 Share and access study materials, notes, and resources</li>
            <li>👥 Find study groups and collaborate with classmates</li>
            <li>🔖 Bookmark useful resources for quick access</li>
            <li>📚 Request specific materials from the community</li>
            <li>🏆 Earn achievements for contributing to the community</li>
          </ul>
          
          <p>This verification link will expire in 24 hours for security reasons.</p>
          
          <p>If you didn't create an account with CampusConnect, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2024 CampusConnect - Academic Resource Sharing Platform</p>
          <p>This is an automated email, please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;

    return sendEmail({
        to: email,
        subject: "📚 CampusConnect - Verify Your Email Address",
        html: htmlTemplate,
    });
};

module.exports = sendVerificationEmail;
