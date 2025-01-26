const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(user) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Welcome to Stock Market Learning App',
        html: `
          <h1>Welcome to Stock Market Learning!</h1>
          <p>Hi ${user.name},</p>
          <p>Thank you for joining our platform. We're excited to help you learn about stock market trading!</p>
          <p>Here's what you can do now:</p>
          <ul>
            <li>Browse our courses</li>
            <li>Practice trading with virtual money</li>
            <li>Track your progress</li>
            <li>Join the community</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy learning!</p>
        `,
      });
      logger.info(`Welcome email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendPasswordResetEmail(user, resetToken) {
    try {
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        `,
      });
      logger.info(`Password reset email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendCourseCompletionEmail(user, course) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: `Congratulations on completing ${course.title}!`,
        html: `
          <h1>Course Completion Certificate</h1>
          <p>Congratulations ${user.name}!</p>
          <p>You have successfully completed the course "${course.title}".</p>
          <p>Your achievements:</p>
          <ul>
            <li>Course completion certificate</li>
            <li>+${course.points} points added to your profile</li>
            <li>New badge unlocked: ${course.badge}</li>
          </ul>
          <p>Keep up the great work!</p>
        `,
      });
      logger.info(`Course completion email sent to ${user.email} for course ${course.title}`);
    } catch (error) {
      logger.error('Error sending course completion email:', error);
      throw new Error('Failed to send course completion email');
    }
  }

  async sendTradeConfirmation(user, trade) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: user.email,
        subject: 'Trade Confirmation',
        html: `
          <h1>Trade Confirmation</h1>
          <p>Hi ${user.name},</p>
          <p>Your trade has been executed successfully:</p>
          <ul>
            <li>Type: ${trade.type}</li>
            <li>Symbol: ${trade.symbol}</li>
            <li>Quantity: ${trade.quantity}</li>
            <li>Price: $${trade.price}</li>
            <li>Total: $${trade.quantity * trade.price}</li>
            <li>Date: ${new Date(trade.createdAt).toLocaleString()}</li>
          </ul>
          <p>View your portfolio for more details.</p>
        `,
      });
      logger.info(`Trade confirmation email sent to ${user.email}`);
    } catch (error) {
      logger.error('Error sending trade confirmation email:', error);
      throw new Error('Failed to send trade confirmation email');
    }
  }
}

module.exports = new EmailService();
