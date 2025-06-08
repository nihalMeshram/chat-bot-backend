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
    @InjectModel(User) private userModel: typeof User,
    private jwtService: JwtService,
  ) { }

  async register(dto: RegisterDto) {
    const { confirmPassword, ...userData } = dto;

    const existing = await this.userModel.findOne({ where: { email: dto.email }, paranoid: false });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    await this.userModel.create(userData as CreationAttributes<User>);
    return {message: 'User registered successfully'};
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.scope('withPassword').findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildToken(user);
  }

  private buildToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
