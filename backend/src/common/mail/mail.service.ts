import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor() {
    // Initialize SendGrid with API key
    if (process.env.SENDGRID_API_KEY) {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }

  async sendOtp(email: string, code: string): Promise<void> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log(`[MailService] SendGrid not configured. OTP for ${email}: ${code}`);
        return;
      }

      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'i.sahilkrsharma@gmail.com';
      
      const msg = {
        to: email,
        from: fromEmail,
        subject: 'Your Ticket Dashboard Login Code',
        text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Ticket Dashboard Login</h2>
            <p>Your verification code is:</p>
            <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; margin: 20px 0; border-radius: 8px;">
              ${code}
            </div>
            <p>This code expires in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Ticket Dashboard - Project Management Tool</p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`[MailService] OTP sent successfully to ${email}`);
    } catch (error) {
      console.error(`[MailService] Failed to send OTP to ${email}:`, error);
      // Fallback to console log if SendGrid fails
      console.log(`[MailService] Fallback - OTP for ${email}: ${code}`);
    }
  }

  async sendNotification(email: string, message: string): Promise<void> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        console.log(`[MailService] SendGrid not configured. Notification for ${email}: ${message}`);
        return;
      }

      const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'i.sahilkrsharma@gmail.com';
      
      const msg = {
        to: email,
        from: fromEmail,
        subject: 'Ticket Dashboard - Activity Update',
        text: `You have a new activity update:\n\n${message}\n\nVisit your dashboard to see the latest changes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Ticket Dashboard Update</h2>
            <p>You have a new activity update:</p>
            <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0; border-radius: 4px;">
              ${message}
            </div>
            <p>Visit your dashboard to see the latest changes and stay updated with your team.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ticket-dashboard-frontend.netlify.app" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Open Dashboard</a>
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">Ticket Dashboard - Project Management Tool</p>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`[MailService] Notification sent successfully to ${email}`);
    } catch (error) {
      console.error(`[MailService] Failed to send notification to ${email}:`, error);
      // Fallback to console log if SendGrid fails
      console.log(`[MailService] Fallback - Notification for ${email}: ${message}`);
    }
  }
}