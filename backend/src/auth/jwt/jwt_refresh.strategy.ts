import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Injectable, UnauthorizedException } from '@nestjs/common'

import { config_jwt } from 'src/config'
import { JwtPayload } from 'src/auth/interfaces'

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        JwtRefreshTokenStrategy.extractJwtRefreshCookie
      ]),
      secretOrKey: config_jwt.secret_refresh,
    })
  }

  private static extractJwtRefreshCookie(request): string | null {
    if (request.cookies && request.cookies.refresh_token) {
      return request.cookies.refresh_token
    }
    return null
  }

  async validate(payload: JwtPayload) {
    if (payload)
      return payload
    throw new UnauthorizedException("Bad payload")
  }
}
