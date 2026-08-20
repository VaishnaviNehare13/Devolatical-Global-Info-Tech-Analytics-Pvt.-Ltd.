import nodemailer from 'nodemailer';
import { config } from '../../config/env';

/**
 * Reusable email transporter using system configuration.
 */
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465, // true for 465, false for other ports
  auth: {
    user: config.email.username,
    password: config.email.password,
  },
} as nodemailer.TransportOptions);

/**
 * Sends a password reset recovery email to the user.
 *
 * @param to Recipient email address
 * @param token Password reset JWT token
 */
export async function sendPasswordResetEmail(to: string, token: string): Promise<void> {
  // Construct recovery link
  // Future extensibility: load frontend baseUrl from config
  const resetUrl = `https://devolatical.com/reset-password?token=${token}`;

  // If in development/test environment and SMTP user is placeholder, log and return
  if (config.app.nodeEnv === 'development' && config.email.username === 'placeholder_user') {
    console.log(`[DEV EMAIL MOCK] Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject: 'Password Reset Request',
    text: `You requested a password reset. Please click on the link below or copy and paste it into your browser to reset your password:\n\n${resetUrl}\n\nThis link is valid for 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <h2 style="color: #333333;">Password Reset Request</h2>
        <p>You requested a password reset. Please click on the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p>This link is valid for 15 minutes. If you did not request this, you can safely ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #666666;">If the button above does not work, copy and paste the following link into your browser:</p>
        <p style="font-size: 12px; word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `,
  });
}

export interface NotificationEmailOptions {
  to: string;
  subject: string;
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
}

/**
 * Sends a system notification email.
 */
export async function sendNotificationEmail(options: NotificationEmailOptions): Promise<void> {
  const { to, subject, title, message, actionUrl, actionText } = options;

  if (
    (config.app.nodeEnv === 'development' || config.app.nodeEnv === 'test') &&
    config.email.username === 'placeholder_user'
  ) {
    console.log(`[DEV/TEST EMAIL MOCK] Notification to ${to}: ${subject} | ${title}`);
    return;
  }

  const actionButtonHtml = actionUrl
    ? `<div style="text-align: center; margin: 30px 0;">
        <a href="${actionUrl}" style="background-color: #0f172a; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">${actionText || 'View Details'}</a>
       </div>`
    : '';

  await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    text: `${title}\n\n${message}${actionUrl ? `\n\nLink: ${actionUrl}` : ''}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #cbd5e1; border-radius: 6px; color: #1e293b;">
        <h2 style="color: #0f172a; margin-bottom: 15px;">${title}</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">${message}</p>
        ${actionButtonHtml}
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">Devolatical Global Info-Tech & Analytics Pvt. Ltd. • Enterprise Notifications</p>
      </div>
    `,
  });
}

/**
 * Non-blocking email dispatch function that catches all email errors safely.
 */
export function sendNotificationEmailSafe(options: NotificationEmailOptions): void {
  sendNotificationEmail(options).catch((err) => {
    console.error(`[EMAIL ERROR] Failed to send email to ${options.to}:`, err.message || err);
  });
}

