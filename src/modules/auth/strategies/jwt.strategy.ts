import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { FastifyRequest } from 'fastify';
import { ConfigService } from '@nestjs/config';

/**
 * JWT authentication strategy using Passport.
 * Extracts JWT token from cookies and validates it.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Extract JWT from 'access_token' cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: FastifyRequest) => request.cookies?.access_token,
      ]),
      ignoreExpiration: false, // Ensure token expiration is respected
      secretOrKey: configService.get<string>('JWT_SECRET'), // JWT secret from env config
    });
  }

  /**
   * Validates the decoded JWT payload.
   * @param payload - The decoded JWT payload
   * @returns An object containing user details to attach to the request
   * @throws UnauthorizedException if payload is invalid
   */
  async validate(payload: any) {
    if (!payload || !payload.sub) throw new UnauthorizedException();

    // Returned value is attached to the request as `request.user`
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
