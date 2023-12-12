import { Module } from '@nestjs/common'

import { TwoFactorAuthenticationController } from './2fa.controller'
import { TwoFactorAuthenticationService } from './2fa.service'

@Module({
  imports: [],

  controllers: [
    TwoFactorAuthenticationController
  ],

  providers: [
    TwoFactorAuthenticationService,
  ],

  exports: [
    TwoFactorAuthenticationService
  ],
})
export class TwoFactorAuthenticationModule { }