import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { Match } from '@common/decorators/match.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  /**
   * The full name of the user. Must not be empty or only whitespace.
   * This value will be trimmed automatically.
   */
  @ApiProperty({
    description: 'Full name of the user',
    example: 'Jane Doe',
  })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Full name must not be empty or whitespace' })
  fullName: string;

  /**
   * The email address of the user. Must be a valid email format.
   */
  @ApiProperty({
    description: 'Email address of the user',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  email: string;

  /**
   * The password for the new account. Must be at least 8 characters long
   * and include at least 1 uppercase letter, 1 number, and 1 special character.
   */
  @ApiProperty({
    description:
      'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character',
    example: 'Secure@123',
  })
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
    message:
      'Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character',
  })
  password: string;

  /**
   * A confirmation of the password. Must match the `password` field.
   */
  @ApiProperty({
    description: 'Must match the password field',
    example: 'Secure@123',
  })
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
