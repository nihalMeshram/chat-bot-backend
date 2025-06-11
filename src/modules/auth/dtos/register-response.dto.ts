import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    example: 'User registered successfully',
    description: 'Register new user',
  })
  message: string;
}
