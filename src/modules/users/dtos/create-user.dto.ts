import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '../types/user-role.type';

export class CreateUserDto {
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

  @IsEnum(UserRole)
  role: UserRole;
}
