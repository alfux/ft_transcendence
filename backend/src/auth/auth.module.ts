// auth.module.ts

import { Module, forwardRef } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@nestjs/jwt'

import { FortyTwoStrategy } from './42api/42api.strategy'
import { JwtStrategy } from './jwt/jwt.strategy'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { config_jwt } from 'src/config'
import { User, UserModule } from 'src/db/user'

@Module({
  imports: [
    JwtModule.register({
      secret: config_jwt.secret,
      signOptions: { expiresIn: config_jwt.expires },
    }),
    PassportModule.register({ defaultStrategy: '42' }),
    forwardRef(() => UserModule)
  ],
  controllers: [AuthController],
  providers: [FortyTwoStrategy, JwtStrategy, AuthService],
  exports: [AuthService],
})
export class AuthModule {}