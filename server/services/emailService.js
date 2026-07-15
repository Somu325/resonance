const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (toEmail, verificationToken) => {
  const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: 'Verify your Resonance account',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e1d6; border-radius: 8px;">
        <h2 style="color: #1f2320; font-family: Georgia, serif;">Verify your Resonance account</h2>
        <p style="color: #1f2320; font-size: 16px; line-height: 1.5; margin: 20px 0;">
          Thank you for signing up for Resonance. Please verify your email address to complete your account setup.
        </p>
        <div style="margin: 30px 0;">
          <a href="${verificationLink}" style="background-color: #4a6b4f; color: #faf8f3; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Verify Email
          </a>
        </div>
        <p style="color: #1f2320; font-size: 14px; opacity: 0.7;">
          If the button doesn't work, copy and paste this link into your browser:
          <br />
          <a href="${verificationLink}" style="color: #4a6b4f;">${verificationLink}</a>
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Verification email sent successfully', { event: 'verification_email_sent', toEmail });
    return info;
  } catch (error) {
    logger.error('Error sending verification email:', { error: error.message, stack: error.stack });
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
};
