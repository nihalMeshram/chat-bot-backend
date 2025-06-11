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

  /**
   * Registers a new user.
   * Route: POST /auth/register
   * @param dto - The registration data (includes email, password, etc.)
   * @returns A success message on successful registration
   */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Logs in a user and sets an access token as an HTTP-only cookie.
   * Route: POST /auth/login
   * @param dto - Login credentials (email and password)
   * @param reply - Fastify reply object used to set cookie
   * @returns A success message on successful login
   */
  @Post('login')
  @HttpCode(200) // Override default 201 status for POST; return 200 instead
  async login(@Body() dto: LoginDto, @Res() reply: FastifyReply) {
    const { accessToken } = await this.authService.login(dto);

    // Set access token in an HTTP-only cookie
    reply.setCookie('access_token', accessToken, {
      httpOnly: true,                          // Prevent client-side JS access
      secure: process.env.NODE_ENV === 'production', // Use secure cookie in production
      sameSite: 'lax',                         // Helps mitigate CSRF
      path: '/',                               // Cookie valid for entire site
      maxAge: 60 * 60 * 24,                    // Cookie expires in 1 day
    });

    return reply.send({ message: 'Login successful' });
  }

  /**
   * Logs out a user by clearing the access token cookie.
   * Route: POST /auth/logout
   * @param reply - Fastify reply object used to clear cookie
   * @returns A success message on successful logout
   */
  @Post('logout')
  logout(@Res() reply: FastifyReply) {
    // Remove the cookie by clearing it
    reply.clearCookie('access_token');
    return reply.send({ message: 'Logged out successfully' });
  }
}
