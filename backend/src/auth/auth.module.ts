import { Module, forwardRef } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'

import { UserModule } from 'src/db/user'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt/jwt.strategy'
import { AuthController } from './auth.controller'
import { JwtRefreshTokenStrategy } from './jwt/jwt_refresh.strategy'

import { FortyTwoModule } from './42api'
import { TwoFactorAuthenticationModule } from './2fa'

@Module({
  imports: [
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: '42' }),
    forwardRef(() => UserModule),

    TwoFactorAuthenticationModule,
    FortyTwoModule,
  ],

  controllers: [
    AuthController,
  ],

  providers: [
    JwtStrategy,
    JwtRefreshTokenStrategy,
    AuthService
  ],

  exports: [
    TwoFactorAuthenticationModule,
    FortyTwoModule,

    AuthService
  ],
})
export class AuthModule { }