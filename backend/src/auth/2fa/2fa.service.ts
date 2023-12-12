import { Injectable, Inject, forwardRef } from '@nestjs/common'
import { authenticator } from 'otplib'
import { toDataURL } from 'qrcode'

const speakeasy = require('speakeasy')

import { UserService } from 'src/db/user'

@Injectable()
export class TwoFactorAuthenticationService {

  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService
  ) { }

  async generateSecret(userEmail: string) {
    const user = await this.userService.getUser({ email: userEmail })
    const secret = speakeasy.generateSecret()
    const otpUrl = authenticator.keyuri(user.email, '42FA', secret.base32)

    user.twoFactorAuthSecret = secret.base32
    await this.userService.updateOrCreateUser(user)

    return {
      secret: secret.base32,
      otpUrl,
    }
  }

  async generateQrCode(optUrl: string) {
    return toDataURL(optUrl)
  }

  generateToken(secret: string) {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
    })
  }

  verifyTwoFactorAuthCode(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    })
  }

}
