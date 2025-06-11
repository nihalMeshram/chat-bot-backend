import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    example: 'Login successfully',
    description: 'User Login',
  })
  message: string;
}
