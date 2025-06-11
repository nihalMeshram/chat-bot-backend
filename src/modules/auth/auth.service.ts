import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes } from 'sequelize';
import { User } from '../users/user.model';
import { RegisterDto, LoginDto } from './dtos';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private userModel: typeof User,  // Injecting the Sequelize User model
    private jwtService: JwtService,                     // Injecting the JWT service for signing tokens
  ) { }

  /**
   * Registers a new user.
   * - Checks for existing email
   * - Hashing is assumed to be handled in a Sequelize hook
   * - Saves new user to database
   *
   * @param dto - Data Transfer Object for registration
   * @throws ConflictException if the email already exists
   * @returns Success message on registration
   */
  async register(dto: RegisterDto) {
    const { confirmPassword, ...userData } = dto;

    // Check if a user already exists with the given email (even soft-deleted users)
    const existing = await this.userModel.findOne({ where: { email: dto.email }, paranoid: false });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    // Create and save the new user (password hashing assumed to be handled in model hook)
    await this.userModel.create(userData as CreationAttributes<User>);
    return { message: 'User registered successfully' };
  }

  /**
   * Authenticates a user and returns a JWT access token.
   * - Checks email and password match
   * - Uses bcrypt to compare passwords
   *
   * @param dto - Data Transfer Object for login
   * @throws UnauthorizedException if email/password are invalid
   * @returns Object containing access token
   */
  async login(dto: LoginDto) {
    // Use 'withPassword' scope to fetch hashed password
    const user = await this.userModel.scope('withPassword').findOne({ where: { email: dto.email } });

    // Check if user exists and password is valid
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate and return JWT access token
    return this.buildToken(user);
  }

  /**
   * Builds JWT access token with user's ID, email, and role as payload.
   *
   * @param user - Authenticated user
   * @returns Object with signed JWT access token
   */
  private buildToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
