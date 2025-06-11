import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { UserRole } from './types/user-role.type';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

@Controller('users') // Routes all endpoints under /users
@UseGuards(JwtAuthGuard, RolesGuard) // Applies JWT authentication and role-based authorization
@Roles(UserRole.ADMIN) // Only users with the ADMIN role can access this controller
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * Create a new user.
   * Route: POST /users
   */
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.userService.create(dto);
  }

  /**
   * Get all users.
   * Route: GET /users
   */
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  /**
   * Get a single user by ID.
   * Route: GET /users/:id
   * Validates the ID as a UUID.
   */
  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.findOne(id);
  }

  /**
   * Update a user by ID.
   * Route: PUT /users/:id
   * Validates the ID as a UUID.
   */
  @Put(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  /**
   * Soft-delete a user by ID.
   * Route: DELETE /users/:id
   * Validates the ID as a UUID.
   */
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.remove(id);
  }

  /**
   * Restore a previously deleted user by ID.
   * Route: PUT /users/:id/restore
   * Validates the ID as a UUID.
   */
  @Put(':id/restore')
  restore(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.userService.restore(id);
  }
}
