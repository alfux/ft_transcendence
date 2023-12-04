import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { config_jwt } from 'src/config';
import { Request } from '../request.interface';
import { JwtPayload } from '../jwtpayload.interface';
import { User42Api } from '../42api/user42api.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtStrategy.extractJwtCookie
    ]),
      secretOrKey: config_jwt.secret_token,
      passReqToCallback: true,
    });
  }

  private static extractJwtCookie(request: Request):string | null{
    if (request.cookies && 'access_token' in request.cookies)
        return request?.cookies?.access_token;
    return null;
}

  //TODO: remove all User42Api into JwtPayload
  validate(payload: JwtPayload): User42Api {
    return {
      id: payload.sub,
      username:payload.username,
      image:payload.image
    }
  }
}
