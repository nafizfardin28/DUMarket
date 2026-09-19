import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  email!: string;

  @Matches(/^\d{6}$/, { message: 'Enter the 6-digit code from your email.' })
  otp!: string;

  @IsString()
  @MinLength(1, { message: 'Password is required.' })
  password!: string;

  @IsString()
  @MinLength(1, { message: 'Please confirm your password.' })
  password2!: string;
}
