import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  /**
   * The email address of the user.
   * Must be a valid email format.
   */
  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  /**
   * The password of the user.
   * Must be a non-empty string.
   */
  @ApiProperty({
    description: 'Password of the user',
    example: 'Secure@123',
  })
  @IsString()
  password: string;
}
