import { IsEmail, Matches } from 'class-validator';

export class VerifyEmailDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  email!: string;

  @Matches(/^\d{6}$/, { message: 'Enter the 6-digit code from your email.' })
  otp!: string;
}
