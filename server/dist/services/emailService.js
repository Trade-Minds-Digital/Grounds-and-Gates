import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
// In-memory capture double for tests and local development
const capturedEmails = [];
export const getCapturedEmails = () => [...capturedEmails];
export const getLastCapturedEmail = () => capturedEmails[capturedEmails.length - 1];
export const clearCapturedEmails = () => {
    capturedEmails.length = 0;
};
// Create Nodemailer Transporter
let transporter = null;
const getTransporter = () => {
    if (transporter)
        return transporter;
    if (config.smtp.host && config.smtp.user) {
        transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.secure,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.password,
            },
        });
        return transporter;
    }
    return null;
};
const BRAND_HEADER = `
  <div style="background-color: #013E18; padding: 24px 32px; text-align: center; border-radius: 8px 8px 0 0;">
    <div style="display: inline-block; background-color: #C99325; color: #013E18; font-weight: bold; font-size: 20px; width: 44px; height: 44px; line-height: 44px; border-radius: 50%; margin-bottom: 8px; text-align: center;">04A</div>
    <h1 style="color: #FAF8F2; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; margin: 0; letter-spacing: 1px;">GROUNDS &amp; GATES</h1>
    <p style="color: #C99325; font-family: sans-serif; font-size: 12px; margin: 4px 0 0; text-transform: uppercase; letter-spacing: 2px;">Heritage &bull; Real Estate &bull; Tamil Nadu</p>
  </div>
`;
const BRAND_FOOTER = `
  <div style="background-color: #FAF8F2; border-top: 1px solid #E8E2D2; padding: 20px 32px; text-align: center; font-family: sans-serif; font-size: 12px; color: #666; border-radius: 0 0 8px 8px;">
    <p style="margin: 0 0 8px;">&copy; ${new Date().getFullYear()} Grounds &amp; Gates Properties Pvt. Ltd. All rights reserved.</p>
    <p style="margin: 0; font-size: 11px; color: #888;">Coimbatore &bull; Chennai &bull; Madurai &bull; Tiruchirappalli</p>
    <p style="margin: 8px 0 0; font-size: 11px; color: #999;">இந்த மின்னஞ்சல் Grounds &amp; Gates தளத்திலிருந்து அனுப்பப்பட்டது.</p>
  </div>
`;
const wrapEmailBody = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grounds &amp; Gates</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #F5F2E9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 12px rgba(1, 62, 24, 0.08); overflow: hidden; border: 1px solid #E8E2D2;">
    ${BRAND_HEADER}
    <div style="padding: 32px; color: #2B2D2F; font-size: 15px; line-height: 1.6;">
      ${content}
    </div>
    ${BRAND_FOOTER}
  </div>
</body>
</html>
`;
export const emailService = {
    /**
     * Core send dispatcher handling capture double, SMTP transport, and graceful fallback
     */
    async send(params) {
        const from = `"${config.smtp.fromName}" <${config.smtp.fromEmail}>`;
        // Always record in captured emails when capture is enabled (e.g. test mode or dev)
        if (config.allowMailCapture) {
            capturedEmails.push({
                to: params.to,
                subject: params.subject,
                html: params.html,
                text: params.text,
                otp: params.otp,
                resetUrl: params.resetUrl,
                timestamp: new Date(),
            });
        }
        const mailer = getTransporter();
        if (!mailer) {
            // In production without SMTP, log warning
            if (config.env === 'production') {
                console.warn(`[EmailService] SMTP not configured. Skipped sending email to ${params.to} ("${params.subject}")`);
            }
            return {
                success: true,
                simulated: true,
                messageId: `simulated-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            };
        }
        try {
            const info = await mailer.sendMail({
                from,
                to: params.to,
                subject: params.subject,
                text: params.text,
                html: params.html,
            });
            return { success: true, messageId: info.messageId };
        }
        catch (err) {
            console.error(`[EmailService] Error dispatching mail to ${params.to}:`, err.message);
            return { success: false, error: err.message };
        }
    },
    /**
     * Verification OTP email
     */
    async sendVerificationOtp(params) {
        const minutes = params.expiresInMinutes || 10;
        const subject = `Your Grounds & Gates Verification Code: ${params.otp}`;
        const htmlContent = `
      <h2 style="color: #013E18; font-family: 'Playfair Display', Georgia, serif; margin-top: 0;">Verify Your Email Address</h2>
      <p style="color: #4A4D4A;">வணக்கம் / Hello <strong>${params.name || 'Valued Client'}</strong>,</p>
      <p>Thank you for choosing Grounds &amp; Gates. Please enter the following 6-digit one-time verification code to activate your account and access verified properties across Tamil Nadu:</p>
      
      <div style="background-color: #FAF8F2; border: 2px dashed #C99325; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #013E18; font-family: monospace;">${params.otp}</span>
        <p style="margin: 8px 0 0; color: #7A7D7A; font-size: 13px;">This code will expire in <strong>${minutes} minutes</strong>.</p>
        <p style="margin: 4px 0 0; color: #7A7D7A; font-size: 12px; font-style: italic;">இந்த குறியீடு ${minutes} நிமிடங்களில் காலாவதியாகும்.</p>
      </div>

      <p style="font-size: 13px; color: #666;">If you did not initiate this registration on Grounds &amp; Gates, you can safely ignore this email. No account will be activated without this verification code.</p>
      <p style="margin-top: 24px; color: #013E18; font-weight: 600;">Grounds &amp; Gates Concierge Team</p>
    `;
        const plainText = `
Hello ${params.name || 'Valued Client'},

Your Grounds & Gates verification code is: ${params.otp}

This code expires in ${minutes} minutes.
Enter this code on the verification screen to activate your account.

If you did not request this, please ignore this email.

Grounds & Gates Team
Coimbatore, Tamil Nadu
    `.trim();
        return this.send({
            to: params.to,
            subject,
            html: wrapEmailBody(htmlContent),
            text: plainText,
            otp: params.otp,
        });
    },
    /**
     * Resent OTP email
     */
    async sendResentOtp(params) {
        const minutes = params.expiresInMinutes || 10;
        const subject = `New Verification Code: ${params.otp} - Grounds & Gates`;
        const htmlContent = `
      <h2 style="color: #013E18; font-family: 'Playfair Display', Georgia, serif; margin-top: 0;">New Verification Code Requested</h2>
      <p style="color: #4A4D4A;">Hello <strong>${params.name || 'Valued Client'}</strong>,</p>
      <p>As requested, here is your new 6-digit verification code. Any previous verification code issued for your account has been invalidated:</p>
      
      <div style="background-color: #FAF8F2; border: 2px dashed #C99325; border-radius: 8px; padding: 20px; text-align: center; margin: 28px 0;">
        <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #013E18; font-family: monospace;">${params.otp}</span>
        <p style="margin: 8px 0 0; color: #7A7D7A; font-size: 13px;">Valid for <strong>${minutes} minutes</strong>.</p>
      </div>

      <p style="font-size: 13px; color: #666;">For security reasons, never share this code with anyone, including Grounds &amp; Gates representatives.</p>
    `;
        const plainText = `
Hello ${params.name || 'Valued Client'},

Here is your new Grounds & Gates verification code: ${params.otp}
Valid for ${minutes} minutes.

Previous codes are no longer valid.
    `.trim();
        return this.send({
            to: params.to,
            subject,
            html: wrapEmailBody(htmlContent),
            text: plainText,
            otp: params.otp,
        });
    },
    /**
     * Password Reset Email
     */
    async sendPasswordResetEmail(params) {
        const hours = params.expiresInHours || 1;
        const subject = 'Reset Your Grounds & Gates Password';
        const htmlContent = `
      <h2 style="color: #013E18; font-family: 'Playfair Display', Georgia, serif; margin-top: 0;">Password Reset Request</h2>
      <p style="color: #4A4D4A;">Hello <strong>${params.name || 'Valued Client'}</strong>,</p>
      <p>We received a request to reset the password for your Grounds &amp; Gates account. Click the button below to set a new password:</p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${params.resetUrl}" style="background-color: #013E18; color: #FAF8F2; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; border: 1px solid #C99325;">Reset Password / கடவுச்சொல்லை மாற்றவும்</a>
      </div>

      <p style="font-size: 13px; color: #7A7D7A;">Or copy and paste this link into your browser:<br>
        <a href="${params.resetUrl}" style="color: #013E18; word-break: break-all;">${params.resetUrl}</a>
      </p>

      <p style="font-size: 13px; color: #666; margin-top: 24px;">This link is valid for <strong>${hours} hour</strong>. If you did not request a password reset, no further action is required and your account remains secure.</p>
    `;
        const plainText = `
Hello ${params.name || 'Valued Client'},

We received a request to reset your Grounds & Gates password.
Click the link below to choose a new password (valid for ${hours} hour):

${params.resetUrl}

If you did not request this, please disregard this email.
    `.trim();
        return this.send({
            to: params.to,
            subject,
            html: wrapEmailBody(htmlContent),
            text: plainText,
            resetUrl: params.resetUrl,
        });
    },
    /**
     * Password Changed Notification Email
     */
    async sendPasswordChangedNotification(params) {
        const subject = 'Security Notice: Grounds & Gates Password Changed';
        const htmlContent = `
      <h2 style="color: #013E18; font-family: 'Playfair Display', Georgia, serif; margin-top: 0;">Your Password Has Been Changed</h2>
      <p style="color: #4A4D4A;">Hello <strong>${params.name || 'Valued Client'}</strong>,</p>
      <p>This is a confirmation that the password for your Grounds &amp; Gates account (<strong>${params.to}</strong>) has been successfully updated.</p>
      <p>All active sessions and devices have been logged out as a standard security precaution. Please log in using your new credentials.</p>
      <p style="font-size: 13px; color: #D32F2F; margin-top: 24px; padding: 12px; background-color: #FFEBEE; border-radius: 4px;">
        <strong>Did not make this change?</strong> Please contact Grounds &amp; Gates support immediately at support@groundsandgates.com or call our Coimbatore concierge.
      </p>
    `;
        const plainText = `
Hello ${params.name || 'Valued Client'},

Your Grounds & Gates account password has been successfully updated.
All other active sessions have been signed out.

If you did not initiate this change, please contact support immediately.
    `.trim();
        return this.send({
            to: params.to,
            subject,
            html: wrapEmailBody(htmlContent),
            text: plainText,
        });
    },
};
