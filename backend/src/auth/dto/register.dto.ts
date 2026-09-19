import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsDuEmail } from '../../common/validators/du-email.validator';
import { IsRegNo } from '../../common/validators/reg-no.validator';
import { IsDuPhone } from '../../common/validators/phone.validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @IsDuEmail()
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'Full name is required.' })
  full_name!: string;

  @IsString()
  @IsRegNo()
  regNo!: string;

  @IsIn(['buyer', 'seller'], { message: 'Please select whether you\'re buying or selling.' })
  role!: 'buyer' | 'seller';

  @IsString()
  @IsNotEmpty({ message: 'Please select your hall.' })
  hall!: string;

  @IsString()
  @IsDuPhone()
  phone!: string;

  @IsString()
  @MinLength(1, { message: 'Password is required.' })
  password!: string;

  @IsString()
  @MinLength(1, { message: 'Please confirm your password.' })
  password2!: string;
}
