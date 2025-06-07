import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreationAttributes, UniqueConstraintError, ValidationError } from 'sequelize';
import { User } from './user.model';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dtos';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userModel: typeof User) {}

  async create(dto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const user = await this.userModel.create(dto as CreationAttributes<User>);
      return plainToInstance(UserResponseDto, user.get({ plain: true }));
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Email already exists');
      }
      if (error instanceof ValidationError) {
        throw new ConflictException(error.errors.map(e => e.message).join(', '));
      }
      throw new InternalServerErrorException('Could not create user');
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.findByPk(id);
    try {
      const updated = await user.update(dto);
      return plainToInstance(UserResponseDto, updated.get({ plain: true }));
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        throw new ConflictException('Email already exists');
      }
      if (error instanceof ValidationError) {
        throw new ConflictException(error.errors.map(e => e.message).join(', '));
      }
      throw new InternalServerErrorException('Could not update user');
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userModel.findAll();
    return plainToInstance(UserResponseDto, users.map(user => user.get({ plain: true })));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.findByPk(id);
    return plainToInstance(UserResponseDto, user.get({ plain: true }));
  }

  async remove(id: string): Promise<{ message: string }> {
    const user = await this.findByPk(id);
    await user.destroy();
    return { message: 'User deleted successfully' };
  }

  async restore(id: string): Promise<{ message: string }> {
    const user = await this.userModel.findByPk(id, { paranoid: false });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await user.restore();
    return { message: 'User restored successfully' };
  }

  async findByPk(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async validateUser(email: string, plainPassword: string): Promise<User | null> {
    const user = await this.userModel.scope('withPassword').findOne({ where: { email } });
    if (user && await bcrypt.compare(plainPassword, user.password)) {
      return user;
    }
    return null;
  }
}
