import { ApiProperty } from '@nestjs/swagger';

export class RestoreUserResponseDto {
  @ApiProperty({
    example: 'User restored successfully',
    description: 'Restored User',
  })
  message: string;
}
