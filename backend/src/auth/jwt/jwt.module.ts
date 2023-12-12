import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'

import { JwtAuthGuard } from './jwt.guard'

@Module({
  imports: [],

  controllers: [
    TwoFactorAuthenticationController
  ],

  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],

  exports: [
    APP_GUARD
  ],
})
export class TwoFactorAuthenticationModule { }
