import {
  Controller,
  Post,
  Body,
  Res,
  HttpCode,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dtos';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res() reply: FastifyReply) {
    const { accessToken } = await this.authService.login(dto);

    reply.setCookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });

    return reply.send({ message: 'Login successful' });
  }

  @Post('logout')
  logout(@Res() reply: FastifyReply) {
    reply.clearCookie('access_token');
    return reply.send({ message: 'Logged out successfully' });
  }
}
