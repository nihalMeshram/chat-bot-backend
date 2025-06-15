import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/sequelize';
import { User } from '../users/user.model';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../users/types/user-role.type';

describe('AuthService', () => {
  let service: AuthService;
  let userModel: typeof User;
  let jwtService: JwtService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    fullName: 'Test User',
    password: 'hashed-password',
    role: UserRole.VIEWER,
    save: jest.fn(),
  };

  const userModelMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    scope: jest.fn().mockReturnThis(),
  };

  const jwtServiceMock = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User), useValue: userModelMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userModel = module.get(getModelToken(User));
    jwtService = module.get(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user if email is not taken', async () => {
      userModelMock.findOne.mockResolvedValue(null);
      userModelMock.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(userModelMock.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        paranoid: false,
      });
      expect(userModelMock.create).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User registered successfully' });
    });

    it('should throw ConflictException if email already exists', async () => {
      userModelMock.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          fullName: 'Test User',
          password: 'password123',
          confirmPassword: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return accessToken if credentials are valid', async () => {
      userModelMock.findOne.mockResolvedValue({ ...mockUser, password: await bcrypt.hash('pass123', 10) });
      jwtServiceMock.sign.mockReturnValue('mocked.jwt.token');

      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'pass123',
      });

      expect(userModelMock.scope).toHaveBeenCalledWith('withPassword');
      expect(jwtServiceMock.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        fullName: mockUser.fullName,
        email: mockUser.email,
        role: mockUser.role,
      });

      expect(result).toEqual({ accessToken: 'mocked.jwt.token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userModelMock.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'notfound@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userModelMock.findOne.mockResolvedValue({ ...mockUser, password: 'hashed-password' });
      jest.spyOn(bcrypt, 'compare' as any).mockResolvedValue(false);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
