import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { Match } from '@common/decorators/match.decorator';

export class RegisterDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Full name must not be empty or whitespace' })
  fullName: string;

  @IsEmail()
  email: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;

  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}