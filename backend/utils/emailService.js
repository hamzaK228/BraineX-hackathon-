import nodemailer from 'nodemailer';
import logger from '../config/logger.js';

/**
 * Email Service for sending notifications
 */

// Create transporter
let transporter;

if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
} else {
  // Demo mode - log emails instead of sending
  logger.info('Email service running in DEMO mode - emails will be logged to console');
}

/**
 * Send welcome email to new users
 */
export const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@brainex.com',
    to: user.email,
    subject: 'Welcome to BraineX!',
    html: `
      <h1>Welcome to BraineX, ${user.firstName}!</h1>
      <p>We're excited to have you join our platform connecting students with scholarships, mentors, and opportunities.</p>
      <p>Get started by exploring:</p>
      <ul>
        <li>🎓 Thousands of scholarships</li>
        <li>👨‍🏫 Expert mentors in your field</li>
        <li>🚀 Collaborative projects</li>
        <li>📅 Exclusive events and workshops</li>
      </ul>
      <p>Best regards,<br>The BraineX Team</p>
    `,
  };

  return sendEmail(mailOptions);
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@brainex.com',
    to: user.email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>Hi ${user.firstName},</p>
      <p>You requested to reset your password. Click the link below to proceed:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  return sendEmail(mailOptions);
};

/**
 * Send scholarship application confirmation
 */
export const sendApplicationConfirmation = async (user, scholarship) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@brainex.com',
    to: user.email,
    subject: 'Application Submitted Successfully',
    html: `
      <h1>Application Submitted!</h1>
      <p>Hi ${user.firstName},</p>
      <p>Your application for <strong>${scholarship.name}</strong> has been submitted successfully.</p>
      <p><strong>Scholarship Details:</strong></p>
      <ul>
        <li>Organization: ${scholarship.organization}</li>
        <li>Amount: ${scholarship.amount}</li>
        <li>Deadline: ${new Date(scholarship.deadline).toLocaleDateString()}</li>
      </ul>
      <p>Good luck!</p>
    `,
  };

  return sendEmail(mailOptions);
};

/**
 * Core email sending function
 */
async function sendEmail(mailOptions) {
  try {
    if (transporter) {
      const info = await transporter.sendMail(mailOptions);
      logger.info('Email sent:', { to: mailOptions.to, messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } else {
      // Demo mode - log instead of sending
      logger.info('📧 [DEMO] Email would be sent:', {
        to: mailOptions.to,
        subject: mailOptions.subject,
      });
      console.log('\n📧 EMAIL DEMO MODE:');
      console.log('To:', mailOptions.to);
      console.log('Subject:', mailOptions.subject);
      console.log('---\n');
      return { success: true, demo: true };
    }
  } catch (error) {
    logger.error('Email send failed:', error);
    throw error;
  }
}

export default {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendApplicationConfirmation,
};
