const nodemailer = require('nodemailer');
const { BadRequestError } = require('../errors');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Send resource upload notification
  async sendResourceUploadNotification({ to, uploaderName, resourceTitle, course }) {
    const subject = `📚 New Resource Available: ${resourceTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .resource-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 CampusConnect</h1>
            <p>New Resource Available</p>
          </div>
          <div class="content">
            <h2>New Resource Uploaded!</h2>
            <p>A new resource has been uploaded to a course you're following:</p>
            
            <div class="resource-info">
              <h3>${resourceTitle}</h3>
              <p><strong>Course:</strong> ${course}</p>
              <p><strong>Uploaded by:</strong> ${uploaderName}</p>
            </div>
            
            <p>Visit CampusConnect to access this resource and explore more study materials.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Send request fulfilled notification
  async sendRequestFulfilledNotification({ to, requesterName, requestTitle, fulfillerName, resourceTitle }) {
    const subject = `✅ Your Resource Request Has Been Fulfilled`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .request-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Request Fulfilled</h1>
            <p>Your resource request has been answered!</p>
          </div>
          <div class="content">
            <h2>Great news, ${requesterName}!</h2>
            <p>Your resource request has been fulfilled by a fellow student:</p>
            
            <div class="request-info">
              <h3>${requestTitle}</h3>
              <p><strong>Fulfilled by:</strong> ${fulfillerName}</p>
              ${resourceTitle ? `<p><strong>Resource provided:</strong> ${resourceTitle}</p>` : ''}
            </div>
            
            <p>Visit CampusConnect to access the resource and thank the contributor!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Send study group notification
  async sendStudyGroupNotification({ to, groupTitle, course, creatorName, message }) {
    const subject = `👥 New Study Group: ${groupTitle}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .group-info { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👥 Study Group</h1>
            <p>New study group formed</p>
          </div>
          <div class="content">
            <h2>Join a Study Group!</h2>
            <p>A new study group has been created for a course you're interested in:</p>
            
            <div class="group-info">
              <h3>${groupTitle}</h3>
              <p><strong>Course:</strong> ${course}</p>
              <p><strong>Created by:</strong> ${creatorName}</p>
              <p><strong>Message:</strong> ${message}</p>
            </div>
            
            <p>Visit CampusConnect to join this study group and collaborate with your classmates!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({ to, subject, html });
  }

  // Generic email sending method
  async sendEmail({ to, subject, html }) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        to,
        subject,
        html,
      });

      console.log(`Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestError(`Failed to send email: ${error.message}`);
    }
  }

  // Send bulk emails with retry logic
  async sendBulkEmails(emails) {
    const results = [];
    const maxRetries = 3;

    for (const emailData of emails) {
      let retries = 0;
      let success = false;

      while (retries < maxRetries && !success) {
        try {
          const result = await this.sendEmail(emailData);
          results.push({ ...emailData, ...result, retries });
          success = true;
        } catch (error) {
          retries++;
          console.error(`Email send attempt ${retries} failed for ${emailData.to}:`, error.message);

          if (retries < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          } else {
            results.push({
              ...emailData,
              success: false,
              error: error.message,
              retries
            });
          }
        }
      }
    }

    return results;
  }

  // Test email configuration
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('Email service connection verified successfully');
      return { success: true, message: 'Email service is ready' };
    } catch (error) {
      console.error('Email service connection failed:', error);
      throw new BadRequestError(`Email service configuration error: ${error.message}`);
    }
  }
}

module.exports = new EmailService();