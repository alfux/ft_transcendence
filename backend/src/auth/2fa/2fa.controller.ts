import { Body, Controller, Get, Post, Req, UnauthorizedException, Inject, forwardRef } from '@nestjs/common'
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger'

import { Route } from 'src/route'
import { Request } from 'src/auth/interfaces'
import { UserService, LoggedStatus } from 'src/db/user'

import { TwoFactorAuthenticationService } from '.'
import * as DTO from './2fa.dto'

@ApiBearerAuth()
@ApiTags('2fa')
@Controller('2fa')
export class TwoFactorAuthenticationController {
  constructor(
    private twoFactorAuthenticationService: TwoFactorAuthenticationService,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) { }

  @Route({
    method: Post('authenticate'),
    description: { summary: "Authenticate using 2FA", description: "Authenticate using 2FA" }
  })
  async authenticateTwoFactor(@Req() request, @Body() body: DTO.AuthenticateParams) {
    console.log(body)
    const user = await this.userService.getUser({ id: request.user.id })
    const secret = user.twoFactorAuthSecret

    //this can be used to send to email
    const token = this.twoFactorAuthenticationService.generateToken(secret)
    try {
      const isCodeValid = this.twoFactorAuthenticationService.verifyTwoFactorAuthCode(
        secret,
        body.code
      )
      console.log("Secret: ", token, "Verification code: ", body.code)
      if (!isCodeValid) {
        throw new UnauthorizedException('Wrong authentication code')
      }
    } catch (error) {
      // Log the error
      console.error('Error in enableTwoFactorAuth:', error)

      // Re-throw the error to maintain the original behavior (returning a 401 response)
      throw new UnauthorizedException('Wrong authentication codee')
    }
    await this.userService.updateOrCreateUser({ id: request.user.id, isAuthenticated: LoggedStatus.Logged })
    return "authenticated"
  }


  @Route({
    method: Post('enable'),
    description: { summary: "Enable 2FA", description: "Enable 2FA" }
  })
  async enableTwoFactorAuth(@Req() request, @Body() body: DTO.AuthenticateParams) {
    console.log("adsas")
    const user = await this.userService.getUser({ id: request.user.id })
    const secret = user.twoFactorAuthSecret
    const token = this.twoFactorAuthenticationService.generateToken(secret)
    console.log('token', token, '\n', 'body token ', body.code)

    try {
      const isCodeValid = this.twoFactorAuthenticationService.verifyTwoFactorAuthCode(
        secret,
        body.code
      )
      if (!isCodeValid) {
        throw new UnauthorizedException('Wrong authentication code')
      }
    } catch (error) {
      console.error('Error in enableTwoFactorAuth:', error)
      throw new UnauthorizedException('Wrong authentication codee')
    }

    user.twoFactorAuth = true
    return this.userService.updateUser({ db_id:user.db_id, id:user.id, twoFactorAuth:true })
  }

  @Route({
    method: Get('generate'),
    description: { summary: "Generates a new secret for 2FA", description: "Generates a new secret for 2FA" }
  })
  async generate(@Req() request) {
    const result = await this.twoFactorAuthenticationService.generateSecret(request.user.email)
    const qrcode = this.twoFactorAuthenticationService.generateQrCode(result.otpUrl)

    return qrcode
  }

  @Route({
    method: Post('disable'),
    description: { summary: "Disables 2FA", description: "Disables 2FA" }
  })
  async disableTwoFactorAuth(@Req() request: Request) {
    const user = await this.userService.getUser({ id: request.user.id })
    return this.userService.updateUser({
      db_id:user.db_id,
      id:user.id,
      twoFactorAuth:false
    })
  }

  @Route({
    method: Get('status'),
    description: { summary: "Status of 2FA authentification", description: "Status of 2FA authentification" }
  })
  async twoFactorAuthStatus(@Req() request: Request) {
    const user = await this.userService.getUser({ id: request.user.id })
    return user.twoFactorAuth ? true : false
  }
}
