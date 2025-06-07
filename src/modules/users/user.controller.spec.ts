import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dtos';
import { UserRole } from './types/user-role.type';

const mockUser = {
  id: 'user-id',
  fullName: 'Test User',
  email: 'test@example.com',
  role: UserRole.VIEWER,
};

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  restore: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);

    // Clear mocks between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call userService.create and return a user', async () => {
      const dto: CreateUserDto = {
        fullName: 'Test User',
        email: 'test@example.com',
        password: 'Pass@123',
        role: UserRole.VIEWER,
      };

      mockUserService.create.mockResolvedValue(mockUser);

      const result = await controller.create(dto);
      expect(mockUserService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      mockUserService.findAll.mockResolvedValue([mockUser]);

      const result = await controller.findAll();
      expect(mockUserService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return one user by ID', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-id');
      expect(mockUserService.findOne).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });
  });

  describe('update', () => {
    it('should update and return the user', async () => {
      const dto: UpdateUserDto = {
        fullName: 'Updated Name',
      };

      const updatedUser = { ...mockUser, fullName: dto.fullName };
      mockUserService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-id', dto);
      expect(mockUserService.update).toHaveBeenCalledWith('user-id', dto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should delete the user and return a message', async () => {
      const message = { message: 'User deleted successfully' };
      mockUserService.remove.mockResolvedValue(message);

      const result = await controller.remove('user-id');
      expect(mockUserService.remove).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(message);
    });
  });

  describe('restore', () => {
    it('should restore the user and return a message', async () => {
      const message = { message: 'User restored successfully' };
      mockUserService.restore.mockResolvedValue(message);

      const result = await controller.restore('user-id');
      expect(mockUserService.restore).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(message);
    });
  });
});
