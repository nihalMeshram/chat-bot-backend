import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../types/user-role.type';

/**
 * DTO for creating a new user.
 * Automatically converted to OpenAPI schema via decorators.
 */
export class CreateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Full name of the user',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Full name must not be empty or whitespace' })
  fullName: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Password@123',
    description:
      'Must contain at least 8 characters, one uppercase letter, one number, and one special character',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;

  @ApiProperty({
    example: UserRole.ADMIN,
    enum: UserRole,
    description: 'Role of the user (ADMIN, USER, etc.)',
  })
  @IsEnum(UserRole)
  role: UserRole;
}
