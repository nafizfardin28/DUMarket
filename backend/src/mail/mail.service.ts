import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('EMAIL_HOST_USER');
    const pass = this.config.get<string>('EMAIL_HOST_PASSWORD');
    this.fromAddress = this.config.get<string>('DEFAULT_FROM_EMAIL') ?? 'DUMarket <no-reply@dumarket.local>';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('EMAIL_HOST') ?? 'smtp.gmail.com',
        port: Number(this.config.get<string>('EMAIL_PORT') ?? 587),
        secure: this.config.get<string>('EMAIL_SECURE') === 'true',
        auth: { user, pass },
      });
    } else {
      // No SMTP credentials configured — fall back to logging the email so
      // local development still works without real delivery.
      this.transporter = null;
    }
  }

  async send(to: string, subject: string, text: string) {
    if (!this.transporter) {
      this.logger.warn(
        `EMAIL_HOST_USER/EMAIL_HOST_PASSWORD not set — printing email instead of sending.\n` +
          `To: ${to}\nSubject: ${subject}\n\n${text}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.fromAddress,
      to,
      subject,
      text,
    });
  }

  async sendVerificationOtp(to: string, firstName: string, otp: string, expiresInMinutes: number) {
    const subject = 'Your DUMarket verification code';
    const message =
      `Hi ${firstName},\n\n` +
      `Welcome to DUMarket! Use this code to confirm your DU student email ` +
      `address and start buying and selling on campus:\n\n` +
      `${otp}\n\n` +
      `This code expires in ${expiresInMinutes} minutes. If you didn't create ` +
      `this account, just ignore this email.\n\n` +
      `— DUMarket`;

    await this.send(to, subject, message);
  }

  async sendPasswordResetOtp(to: string, firstName: string, otp: string, expiresInMinutes: number) {
    const subject = 'Your DUMarket password reset code';
    const message =
      `Hi ${firstName},\n\n` +
      `Use this code to reset your DUMarket password:\n\n` +
      `${otp}\n\n` +
      `This code expires in ${expiresInMinutes} minutes. If you didn't request a ` +
      `password reset, you can safely ignore this email — your password won't change.\n\n` +
      `— DUMarket`;

    await this.send(to, subject, message);
  }
}
