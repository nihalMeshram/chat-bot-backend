import { validate } from 'class-validator';
import { Match } from './match.decorator';

class TestDto {
  password: string;

  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

describe('Match decorator', () => {
  it('should pass validation when values match', async () => {
    const dto = new TestDto();
    dto.password = 'Secret123';
    dto.confirmPassword = 'Secret123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when values do not match', async () => {
    const dto = new TestDto();
    dto.password = 'Secret123';
    dto.confirmPassword = 'WrongPassword';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.Match).toBe('Passwords do not match');
  });
});
