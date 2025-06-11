import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO for updating an existing user.
 * All fields from CreateUserDto are optional here.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
