import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendOtp(email: string, code: string): Promise<void> {
    // For now, just log the OTP instead of sending email
    // This prevents SMTP connection timeouts on Render
    console.log(`[MailService] OTP for ${email}: ${code}`);
    console.log(`[MailService] In production, this would be sent via email`);
    
    // TODO: Configure proper SMTP service (SendGrid, Resend, etc.)
    // if (!this.transporter) {
    //   console.log(`[MailService] SMTP not configured. OTP for ${email}: ${code}`);
    //   return;
    // }
    
    // const from = process.env.MAIL_FROM ?? 'no-reply@ticket-dashboard';
    // await this.transporter.sendMail({
    //   from,
    //   to: email,
    //   subject: 'Your login code',
    //   text: `Your OTP code is ${code}. It expires in 10 minutes.`,
    // });
  }
}


