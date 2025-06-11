import { ROLES_KEY, Roles } from './roles.decorator';
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../modules/users/types/user-role.type';

jest.mock('@nestjs/common', () => ({
  ...jest.requireActual('@nestjs/common'),
  SetMetadata: jest.fn(),
}));

describe('Roles Decorator', () => {
  it('should call SetMetadata with correct key and roles', () => {
    const roles: UserRole[] = [UserRole.ADMIN, UserRole.EDITOR];
    Roles(...roles);

    expect(SetMetadata).toHaveBeenCalledWith(ROLES_KEY, roles);
  });
});
