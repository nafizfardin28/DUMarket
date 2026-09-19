import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { presentUser } from './user.presenter';
import { validatePasswordPolicy } from '../common/password-policy';
import { fieldError } from '../common/validation-exception-factory';
import { UPLOADS_DIR } from '../common/image-upload';

const OTP_TTL_MINUTES = 5;

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// JwtSignOptions types `expiresIn` as a template-literal union (e.g. "30m"),
// which is stricter than what a plain string read out of process.env can
// statically prove. The values only ever come from our own .env, so the
// cast is safe.
function expiresIn(value: string | undefined): any {
  return value;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {}

  // --- Registration -------------------------------------------------

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    const regNo = dto.regNo.trim();

    if (await this.prisma.user.findUnique({ where: { email } })) {
      fieldError('email', 'An account with this email already exists.');
    }
    if (await this.prisma.user.findUnique({ where: { regNo } })) {
      fieldError('regNo', 'An account with this registration number already exists.');
    }
    if (dto.password !== dto.password2) {
      fieldError('password2', 'Passwords do not match.');
    }

    const passwordErrors = validatePasswordPolicy(dto.password, {
      email,
      fullName: dto.full_name,
    });
    if (passwordErrors.length) {
      throw new BadRequestException({ password: passwordErrors });
    }

    const hashed = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        fullName: dto.full_name.trim(),
        regNo,
        role: dto.role,
        hall: dto.hall,
        phone: dto.phone.trim(),
        isEmailVerified: false,
      },
    });

    const otpExpiresAt = await this.sendVerificationOtp(user.id, user.email, user.fullName);

    return {
      detail: 'Account created. Check your DU student email for a verification code.',
      user: presentUser(user),
      otpExpiresAt,
    };
  }

  private async sendVerificationOtp(userId: number, email: string, fullName: string) {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await this.prisma.user.update({
      where: { id: userId },
      data: { emailOtp: otp, emailOtpExpiresAt: expiresAt },
    });

    const firstName = fullName.split(' ')[0] || email;
    await this.mail.sendVerificationOtp(email, firstName, otp, OTP_TTL_MINUTES);

    return expiresAt.toISOString();
  }

  // --- Email verification --------------------------------------------

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new BadRequestException({ detail: ['Invalid verification code.'] });
    }

    if (user.isEmailVerified) {
      return { detail: 'Email already verified.', user: presentUser(user) };
    }

    const expired = !user.emailOtpExpiresAt || user.emailOtpExpiresAt.getTime() < Date.now();
    if (!user.emailOtp || expired || user.emailOtp !== dto.otp) {
      throw new BadRequestException({
        detail: ['This code is invalid or has expired.'],
      });
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailOtp: null, emailOtpExpiresAt: null },
    });

    return { detail: 'Email verified successfully.', user: presentUser(updated) };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const email = dto.email.trim().toLowerCase();
    // Always report the same fixed expiry whether or not the account exists,
    // so this endpoint can't be used to probe for registered emails.
    const fallbackExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
    const detail = "If that account exists and isn't verified yet, a new code has been sent.";

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.isEmailVerified) {
      return { detail, otpExpiresAt: fallbackExpiresAt };
    }

    const otpExpiresAt = await this.sendVerificationOtp(user.id, user.email, user.fullName);
    return { detail, otpExpiresAt };
  }

  // --- Password reset --------------------------------------------------

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    // Always report the same fixed expiry whether or not the account exists,
    // so this endpoint can't be used to probe for registered emails.
    const fallbackExpiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString();
    const detail = 'If that account exists, a password reset code has been sent to its email.';

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { detail, otpExpiresAt: fallbackExpiresAt };
    }

    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetOtp: otp, passwordResetOtpExpiresAt: expiresAt },
    });

    const firstName = user.fullName.split(' ')[0] || user.email;
    await this.mail.sendPasswordResetOtp(user.email, firstName, otp, OTP_TTL_MINUTES);

    return { detail, otpExpiresAt: expiresAt.toISOString() };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    const invalidCodeError = () =>
      new BadRequestException({ detail: ['This code is invalid or has expired.'] });

    if (!user) throw invalidCodeError();

    const expired =
      !user.passwordResetOtpExpiresAt || user.passwordResetOtpExpiresAt.getTime() < Date.now();
    if (!user.passwordResetOtp || expired || user.passwordResetOtp !== dto.otp) {
      throw invalidCodeError();
    }

    if (dto.password !== dto.password2) {
      fieldError('password2', 'Passwords do not match.');
    }

    const passwordErrors = validatePasswordPolicy(dto.password, {
      email: user.email,
      fullName: user.fullName,
    });
    if (passwordErrors.length) {
      throw new BadRequestException({ password: passwordErrors });
    }

    const hashed = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, passwordResetOtp: null, passwordResetOtpExpiresAt: null },
    });

    return { detail: 'Password reset successfully. You can log in now.' };
  }

  // --- Login / tokens --------------------------------------------------

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });

    const credentialsError = () =>
      new UnauthorizedException({
        detail: ['No active account found with the given credentials.'],
      });

    if (!user || !user.isActive) throw credentialsError();

    const passwordOk = await bcrypt.compare(dto.password, user.password);
    if (!passwordOk) throw credentialsError();

    if (!user.isEmailVerified) {
      throw new UnauthorizedException({
        detail: ['Please verify your DU student email before logging in.'],
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const { access, refresh } = await this.issueTokens(user.id, user.email);
    return { access, refresh, user: presentUser(user) };
  }

  async refresh(dto: RefreshTokenDto) {
    let payload: { sub: number; tokenType: string };
    try {
      payload = await this.jwt.verifyAsync(dto.refresh, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
      if (payload.tokenType !== 'refresh') throw new Error('wrong token type');
    } catch {
      throw new UnauthorizedException({ detail: ['Token is invalid or expired.'] });
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException({ detail: ['Token is invalid or expired.'] });
    }

    return this.issueTokens(user.id, user.email);
  }

  private async issueTokens(userId: number, email: string) {
    const access = await this.jwt.signAsync(
      { sub: userId, email },
      {
        secret: this.config.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: expiresIn(this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '30m'),
      },
    );
    const refresh = await this.jwt.signAsync(
      { sub: userId, tokenType: 'refresh' },
      {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: expiresIn(this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d'),
      },
    );
    return { access, refresh };
  }

  // --- Profile ----------------------------------------------------------

  async me(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException({ detail: ['User not found.'] });
    return presentUser(user);
  }

  async updateAvatar(userId: number, filename: string) {
    const previous = await this.prisma.user.findUnique({ where: { id: userId } });
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatar: filename },
    });

    // Best-effort cleanup of the old file — never let this fail the request.
    if (previous?.avatar) {
      unlink(join(UPLOADS_DIR, previous.avatar)).catch(() => {});
    }

    return presentUser(updated);
  }
}
