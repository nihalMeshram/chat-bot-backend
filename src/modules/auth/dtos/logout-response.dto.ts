import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Logout successfully',
    description: 'User Logout',
  })
  message: string;
}
