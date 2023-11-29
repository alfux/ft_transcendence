import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, Req, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  private static extractJwtRefreshCookie(@Req() request):string | null{
    if (request.cookies && 'refresh_token' in request.cookies){
      return request.cookies.refresh_token;
    }
    console.log('no token found')
    return null;
  }
  
  validate(req: Request, payload: any) {
    const refreshToken = req.cookies.refresh_token;
    console.log('refreshtoken: ', refreshToken)
    if (!refreshToken){
      console.log("no refresh token")
      throw new UnauthorizedException("no refreshToken");
    }
    return { ...payload, refreshToken };
  }
}
