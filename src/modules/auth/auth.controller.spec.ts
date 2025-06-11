import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos';
import { FastifyReply } from 'fastify';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return success message', async () => {
      const dto: RegisterDto = {
        email: 'test@example.com',
        password: '123456',
        confirmPassword: '123456',
        fullName: 'Test User',
      };

      mockAuthService.register.mockResolvedValue({ message: 'User registered successfully' });

      const result = await controller.register(dto);
      expect(result).toEqual({ message: 'User registered successfully' });
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('login', () => {
    it('should login user and set cookie', async () => {
      const dto: LoginDto = {
        email: 'test@example.com',
        password: '123456',
      };

      const mockReply = {
        setCookie: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as FastifyReply;

      mockAuthService.login.mockResolvedValue({ accessToken: 'mocked.token' });

      await controller.login(dto, mockReply);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(mockReply.setCookie).toHaveBeenCalledWith(
        'access_token',
        'mocked.token',
        expect.objectContaining({
          httpOnly: true,
          secure: expect.any(Boolean),
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24,
        })
      );
      expect(mockReply.send).toHaveBeenCalledWith({ message: 'Login successful' });
    });
  });

  describe('logout', () => {
    it('should clear cookie and return message', () => {
      const mockReply = {
        clearCookie: jest.fn().mockReturnThis(),
        send: jest.fn(),
      } as unknown as FastifyReply;

      controller.logout(mockReply);

      expect(mockReply.clearCookie).toHaveBeenCalledWith('access_token');
      expect(mockReply.send).toHaveBeenCalledWith({ message: 'Logged out successfully' });
    });
  });
});
