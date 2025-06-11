// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { UserService } from './user.service';
import { User } from './user.model';
import { ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { UserRole } from './types/user-role.type';
import { UniqueConstraintError, ValidationError } from 'sequelize';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

const mockUser = {
  id: 'user-id',
  fullName: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  role: 'viewer',
  get: jest.fn().mockReturnThis(),
  update: jest.fn().mockResolvedValue(this),
  destroy: jest.fn().mockResolvedValue(undefined),
  restore: jest.fn().mockResolvedValue(undefined),
};

const userArray = [mockUser];

const mockUserModel = {
  create: jest.fn().mockResolvedValue(mockUser),
  findAll: jest.fn().mockResolvedValue(userArray),
  findByPk: jest.fn().mockResolvedValue(mockUser),
  findOne: jest.fn().mockResolvedValue(mockUser),
  scope: jest.fn().mockReturnThis(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password@123',
      role: UserRole.VIEWER,
    };
    const result = await service.create(dto);
    expect(result).toHaveProperty('email', dto.email);
  });

  it('should throw ValidationError when creating user', async () => {
    const dto: CreateUserDto = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password@123',
      role: UserRole.VIEWER,
    };
    mockUserModel.create = jest.fn().mockRejectedValue(new ValidationError('ValidationError', []));
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw UniqueConstraintError when creating user', async () => {
    const dto: CreateUserDto = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password@123',
      role: UserRole.VIEWER,
    };
    mockUserModel.create = jest.fn().mockRejectedValue(new UniqueConstraintError({ message: 'Email already exists' }));
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('should throw InternalServerErrorException when creating user', async () => {
    const dto: CreateUserDto = {
      fullName: 'Test User',
      email: 'test@example.com',
      password: 'Password@123',
      role: UserRole.VIEWER,
    };
    mockUserModel.create = jest.fn().mockRejectedValue(new InternalServerErrorException('InternalServerError'));
    await expect(service.create(dto)).rejects.toThrow(InternalServerErrorException);
  });

  it('should return all users', async () => {
    const result = await service.findAll();
    expect(result.length).toBe(1);
    expect(result[0]).toHaveProperty('email', 'test@example.com');
  });

  it('should return one user by id', async () => {
    const result = await service.findOne('user-id');
    expect(result).toHaveProperty('id', 'user-id');
  });

  it('should throw NotFoundException if user not found', async () => {
    mockUserModel.findByPk = jest.fn().mockResolvedValue(null);
    await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('should update user', async () => {
    const dto: UpdateUserDto = { fullName: 'Updated Name' };
    mockUserModel.findByPk = jest.fn().mockResolvedValue(mockUser);
    mockUser.update = jest.fn().mockResolvedValue({ ...mockUser, fullName: dto.fullName });
    const result = await service.update('user-id', dto);
    expect(result).toHaveProperty('fullName', 'Updated Name');
  });

  it('should throw ValidationError when updating user', async () => {
    const dto: UpdateUserDto = {
      role: UserRole.EDITOR,
    };
    mockUserModel.findByPk = jest.fn().mockResolvedValue(mockUser);
    mockUser.update = jest.fn().mockRejectedValue(new ValidationError('ValidationError', []));
    await expect(service.update(mockUser.id, dto)).rejects.toThrow(ConflictException);
  });

  it('should throw UniqueConstraintError when updating user', async () => {
    const dto: UpdateUserDto = {
      role: UserRole.EDITOR,
    };
    mockUserModel.findByPk = jest.fn().mockResolvedValue(mockUser);
    mockUser.update = jest.fn().mockRejectedValue(new UniqueConstraintError({ message: 'Email already exists' }));
    await expect(service.update(mockUser.id, dto)).rejects.toThrow(ConflictException);
  });

  it('should throw InternalServerErrorException when updating user', async () => {
    const dto: UpdateUserDto = {
      role: UserRole.EDITOR,
    };
    mockUserModel.findByPk = jest.fn().mockResolvedValue(mockUser);
    mockUser.update = jest.fn().mockRejectedValue(new InternalServerErrorException('InternalServerError'));
    await expect(service.update(mockUser.id, dto)).rejects.toThrow(InternalServerErrorException);
  });

  it('should soft delete user', async () => {
    const result = await service.remove('user-id');
    expect(result).toEqual({ message: 'User deleted successfully' });
  });

  it('should restore user', async () => {
    const result = await service.restore('user-id');
    expect(result).toEqual({ message: 'User restored successfully' });
  });

  it('should throw Not Found Exception when restore user', async () => {
    mockUserModel.findByPk = jest.fn().mockResolvedValue(null);
    await expect(service.restore('invalid-id')).rejects.toThrow(NotFoundException);
  });

  it('should return user if email exists and password matches', async () => {
    mockUserModel.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const result = await service.validateUser('test@example.com', 'plainPassword');

    expect(mockUserModel.scope).toHaveBeenCalledWith('withPassword');
    expect(mockUserModel.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    expect(bcrypt.compare).toHaveBeenCalledWith('plainPassword', mockUser.password);
    expect(result).toEqual(mockUser);
  });

  it('should return null if user is not found', async () => {
    mockUserModel.findOne.mockResolvedValue(null);

    const result = await service.validateUser('test@example.com', 'plainPassword');

    expect(result).toBeNull();
  });

  it('should return null if password does not match', async () => {
    mockUserModel.findOne.mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const result = await service.validateUser('test@example.com', 'wrongPassword');

    expect(result).toBeNull();
  });
});
