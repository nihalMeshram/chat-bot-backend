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
  HttpCode,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserResponseDto,
  DeleteUserResponseDto,
  RestoreUserResponseDto,
} from './dtos';
import { UserRole } from './types/user-role.type';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';

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
  @HttpCode(201)
  @ApiOkResponse({
    description: 'The user has been successfully created.',
    type: UserResponseDto,
  })
  @ApiOperation({ summary: 'Create new user', description: 'Creates new user with given role' })
  create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(dto);
  }

  /**
   * Get all users.
   * Route: GET /users
   */
  @Get()
  @ApiOkResponse({
    description: 'Fetch all users successfully.',
    type: UserResponseDto,
    isArray: true,
  })
  @ApiOperation({ summary: 'Fetch all users', description: 'Returns all users' })
  findAll(): Promise<UserResponseDto[]> {
    return this.userService.findAll();
  }

  /**
   * Get a single user by ID.
   * Route: GET /users/:id
   * Validates the ID as a UUID.
   */
  @Get(':id')
  @ApiOkResponse({
    description: 'Fetch user by id successfully.',
    type: UserResponseDto,
  })
  @ApiOperation({ summary: 'Fetch users by id', description: 'Returns user by id' })
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  /**
   * Update a user by ID.
   * Route: PUT /users/:id
   * Validates the ID as a UUID.
   */
  @Put(':id')
  @ApiOkResponse({
    description: 'The user has been successfully updated.',
    type: UserResponseDto,
  })
  @ApiOperation({ summary: 'Update user by id', description: 'Updates user with given id' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto
  ): Promise<UserResponseDto> {
    return this.userService.update(id, dto);
  }

  /**
   * Soft-delete a user by ID.
   * Route: DELETE /users/:id
   * Validates the ID as a UUID.
   */
  @Delete(':id')
  @ApiOkResponse({
    description: 'The user has been successfully deleted.',
    type: DeleteUserResponseDto,
  })
  @ApiOperation({ summary: 'Delete user by id', description: 'Deletes user with given id' })
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<DeleteUserResponseDto> {
    return this.userService.remove(id);
  }

  /**
   * Restore a previously deleted user by ID.
   * Route: PUT /users/:id/restore
   * Validates the ID as a UUID.
   */
  @Put(':id/restore')
  @ApiOkResponse({
    description: 'The user has been successfully restored.',
    type: RestoreUserResponseDto,
  })
  @ApiOperation({ summary: 'Restore user by id', description: 'Restore user with given id' })
  restore(@Param('id', new ParseUUIDPipe()) id: string): Promise<RestoreUserResponseDto> {
    return this.userService.restore(id);
  }
}
