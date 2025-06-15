import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO returned when a user is fetched or created.
 * Excludes sensitive fields like password and deletedAt from the response.
 */
export class UserResponseDto {
  @ApiProperty({
    example: 'e4b6f736-6b1b-4d97-8b97-0f0f2d4bfe44',
    description: 'Unique identifier of the user',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'Jane Doe',
    description: 'Full name of the user',
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    example: 'jane@example.com',
    description: 'Email address of the user',
  })
  @Expose()
  email: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'Role assigned to the user',
  })
  @Expose()
  role: string;

  @ApiProperty({
    example: '2024-01-01T12:34:56.789Z',
    description: 'Timestamp of user creation',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-10T09:45:23.123Z',
    description: 'Timestamp of last user update',
  })
  @Expose()
  updatedAt: Date;

  /**
   * User's password.
   * This field is excluded from the serialized response for security reasons.
   */
  @Exclude()
  password: string;

  @ApiProperty({
    example: '2024-01-10T09:45:23.123Z',
    description: 'Timestamp of user deletion',
  })
  @Expose()
  deletedAt?: Date;
}
