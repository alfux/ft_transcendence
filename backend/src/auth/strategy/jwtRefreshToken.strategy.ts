import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type Payload = {
  sub:string;
}

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtRefreshTokenStrategy.extractJwtRefreshCookie
      ]),
      secretOrKey: configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

  private static extractJwtRefreshCookie(@Req() request): string | null {
    if (request.cookies && 'refresh_token' in request.cookies) {
      return request.cookies.refresh_token;
    }
    console.log('no token found');
    return null;
  }

  async validate(@Req() request, payload: Payload) {
    try {
      const refreshToken = request.cookies.refresh_token;
      console.log('The refresh token: ', refreshToken);
      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token provided');
      }
      return payload;
    } catch (error) {
      // Log the error or handle it appropriately
      console.error('Error in validate:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
