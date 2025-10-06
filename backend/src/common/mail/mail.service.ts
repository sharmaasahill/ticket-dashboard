import { Injectable } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: false,
      auth: process.env.SMTP_USER && process.env.SMTP_PASS ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      } : undefined,
    });
  }

  async sendOtp(email: string, code: string): Promise<void> {
    const from = process.env.MAIL_FROM ?? 'no-reply@ticket-dashboard';
    await this.transporter.sendMail({
      from,
      to: email,
      subject: 'Your login code',
      text: `Your OTP code is ${code}. It expires in 10 minutes.`,
    });
  }
}


